import {
	PuppeteerBlocker,
	adsAndTrackingLists,
	adsLists,
} from "@ghostery/adblocker-puppeteer";
import type {
	CreateScreenshotSchema,
	ResourceTypeSchema,
} from "@screenshothis/schemas/screenshots";
import fetch from "cross-fetch";
import { and, eq, sql } from "drizzle-orm";
import pLimit from "p-limit";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import type { ObjectToCamel } from "ts-case-convert";
import wildcardMatch from "wildcard-match";
import type { z } from "zod";

import { isScreenshotOriginAllowed } from "../actions/validate-screenshot-origin";
import { db } from "../db";
import { screenshots } from "../db/schema/screenshots";
import { s3 } from "../lib/s3";

puppeteer.use(StealthPlugin());

type GetOrCreateScreenshotParams = ObjectToCamel<
	z.infer<typeof CreateScreenshotSchema>
>;

const limit = pLimit(10);

export async function getOrCreateScreenshot(
	workspaceId: string,
	params: GetOrCreateScreenshotParams,
): Promise<{
	object: ArrayBuffer | null;
	key: string | null;
	created: boolean;
}> {
	return limit(async () => {
		const {
			url,
			selector,
			width,
			height,
			isMobile,
			isLandscape,
			hasTouch,
			deviceScaleFactor,
			format,
			blockAds,
			blockCookieBanners,
			blockTrackers,
			blockRequests,
			blockResources,
			prefersColorScheme,
			prefersReducedMotion,
			isCached,
			cacheTtl,
			cacheKey,
		} = params;

		const existing = await db.query.screenshots.findFirst({
			where: and(
				eq(screenshots.url, url),
				selector ? eq(screenshots.selector, selector) : undefined,
				eq(screenshots.width, width),
				eq(screenshots.height, height),
				eq(screenshots.isMobile, isMobile),
				eq(screenshots.isLandscape, isLandscape),
				eq(screenshots.hasTouch, hasTouch),
				eq(screenshots.deviceScaleFactor, deviceScaleFactor),
				eq(screenshots.format, format),
				eq(screenshots.blockAds, blockAds),
				eq(screenshots.blockCookieBanners, blockCookieBanners),
				eq(screenshots.blockTrackers, blockTrackers),
				sql`${screenshots.blockRequests} @> ${JSON.stringify(blockRequests || [])}`,
				sql`${screenshots.blockResources} @> ${JSON.stringify(blockResources || [])}`,
				eq(screenshots.prefersColorScheme, prefersColorScheme),
				eq(screenshots.prefersReducedMotion, prefersReducedMotion),
				eq(screenshots.workspaceId, workspaceId),
				eq(screenshots.isCached, isCached),
				cacheTtl ? eq(screenshots.cacheTtl, cacheTtl) : undefined,
				cacheKey ? eq(screenshots.cacheKey, cacheKey) : undefined,
			),
		});

		if (existing) {
			const key = `screenshots/${workspaceId}/${existing.id}.${format}`;
			const object = await s3.file(key).arrayBuffer();

			return { object, key, created: false };
		}

		const allowed = await isScreenshotOriginAllowed(workspaceId, url);
		if (!allowed) {
			return { object: null, key: null, created: false };
		}

		const startTime = Date.now();

		const browser = await puppeteer.launch({
			headless: true,
			args: ["--no-sandbox", "--disable-setuid-sandbox"],
			defaultViewport: {
				width: width / deviceScaleFactor,
				height: height / deviceScaleFactor,
				isMobile,
				isLandscape,
				hasTouch,
				deviceScaleFactor,
			},
		});
		const page = await browser.newPage();

		page.emulateMediaFeatures([
			{
				name: "prefers-color-scheme",
				value: prefersColorScheme,
			},
			{
				name: "prefers-reduced-motion",
				value: prefersReducedMotion,
			},
		]);

		if (
			(blockRequests && blockRequests?.length > 0) ||
			blockResources?.length > 0
		) {
			const blockRequest = wildcardMatch(blockRequests || [], {
				separator: false,
			});

			page.on("request", (request) => {
				if (blockResources?.includes(request.resourceType() as never)) {
					request.abort();
					return;
				}

				if (blockRequest(request.url())) {
					request.abort();
					return;
				}

				request.continue();
			});
		}

		try {
			const blocker = await PuppeteerBlocker.fromLists(fetch, [
				...(blockAds ? adsLists : []),
				...(blockCookieBanners
					? [
							"https://secure.fanboy.co.nz/fanboy-cookiemonster.txt",
							"https://secure.fanboy.co.nz/fanboy-annoyance.txt",
						]
					: []),
				...(blockTrackers ? adsAndTrackingLists : []),
			]);
			await blocker.enableBlockingInPage(page);

			await page.goto(url, { waitUntil: "networkidle0" });

			let buffer: Uint8Array<ArrayBufferLike> | null = null;
			if (selector) {
				await page.waitForSelector(selector);
				const element = await page.$(selector);
				if (element) {
					buffer = await element.screenshot({
						quality: 80,
						type: "jpeg",
					});
				}
			} else {
				buffer = await page.screenshot({
					quality: 80,
					type: "jpeg",
				});
			}

			if (!buffer) {
				throw new Error("Failed to generate screenshot");
			}

			const [inserted] = await db
				.insert(screenshots)
				.values({
					url,
					selector,
					width,
					height,
					isMobile,
					isLandscape,
					hasTouch,
					deviceScaleFactor,
					format,
					blockAds,
					blockCookieBanners,
					blockTrackers,
					blockRequests,
					blockResources: blockResources as Array<
						z.infer<typeof ResourceTypeSchema>
					>,
					prefersColorScheme,
					prefersReducedMotion,
					isCached,
					cacheTtl,
					cacheKey,
					duration: Number.parseFloat(
						((Date.now() - startTime) / 1000).toFixed(2),
					),
					workspaceId,
				})
				.returning();

			const key = `screenshots/${workspaceId}/${inserted.id}.${format}`;
			await s3.write(key, buffer);
			await page.close();

			const object = await s3.file(key).arrayBuffer();

			return { object, key, created: true };
		} finally {
			// Ensure resources are closed if not already
			if (!page.isClosed()) await page.close();
			await browser.close();
		}
	});
}
