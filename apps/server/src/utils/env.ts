import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		CORS_ORIGIN: z.string().url().optional(),
		DATABASE_URL: z.string(),
		AWS_ACCESS_KEY_ID: z.string(),
		AWS_SECRET_ACCESS_KEY: z.string(),
		AWS_REGION: z.string().optional(),
		AWS_BUCKET: z.string(),
		AWS_URL: z.string().optional(),
		AWS_ENDPOINT: z.string().optional(),
		AWS_USE_PATH_STYLE_ENDPOINT: z.coerce.boolean().optional(),
		POLAR_ACCESS_TOKEN: z.string().optional(),
		POLAR_SUCCESS_URL: z.string().optional(),
		POLAR_SERVER: z
			.enum(["sandbox", "production"])
			.default("sandbox")
			.optional(),
		POLAR_WEBHOOK_SECRET: z.string().optional(),
		POLAR_LITE_PRODUCT_ID: z
			.string()
			.uuid({
				message: "POLAR_LITE_PRODUCT_ID must be a valid UUID",
			})
			.optional(),
		POLAR_PRO_PRODUCT_ID: z
			.string()
			.uuid({
				message: "POLAR_PRO_PRODUCT_ID must be a valid UUID",
			})
			.optional(),
		POLAR_ENTERPRISE_PRODUCT_ID: z
			.string()
			.uuid({
				message: "POLAR_ENTERPRISE_PRODUCT_ID must be a valid UUID",
			})
			.optional(),
		BETTER_AUTH_SECRET: z.string(),
		DEFAULT_API_KEY_PREFIX: z.string(),
		GOOGLE_CLIENT_ID: z.string().optional(),
		GOOGLE_CLIENT_SECRET: z.string().optional(),
		REDIS_URL: z.string().default("redis://127.0.0.1:6379"),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
