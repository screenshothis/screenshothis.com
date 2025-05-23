import type { S3Options } from "bun";

import { s3 } from "#/lib/s3";
import { env } from "#/utils/env";

/**
 * Saves an arbitrary file/byte-array to the specified key (path) in S3/R2.
 *
 * @param file  File, Blob, ArrayBuffer or Uint8Array with the binary contents
 * @param key   Destination key (e.g. "avatars/12345.jpg")
 *
 * @example
 * import { uploadFile } from "#/actions/upload-file";
 * await uploadFile(file, `avatars/${userId}.png`);
 */
export async function uploadFile(
	file: File | Blob | ArrayBuffer | Uint8Array,
	key: string,
	options: { maxSizeBytes?: number; allowedTypes?: string[] } & S3Options = {},
): Promise<string> {
	let data: Uint8Array;

	// Validate key to prevent path traversal
	if (key.includes("..") || key.startsWith("/")) {
		throw new Error("Invalid key: path traversal not allowed");
	}

	// Validate allowed MIME types (only applies to Blob/File)
	if (options.allowedTypes && file instanceof Blob) {
		const fileType = file.type;
		if (!options.allowedTypes.includes(fileType)) {
			throw new Error(
				`File type "${fileType}" is not allowed. Allowed types: ${options.allowedTypes.join(
					", ",
				)}`,
			);
		}
	}

	if (file instanceof Uint8Array) {
		data = file;
	} else if (file instanceof ArrayBuffer) {
		data = new Uint8Array(file);
	} else if (file instanceof Blob) {
		data = new Uint8Array(await file.arrayBuffer());
	} else {
		throw new TypeError("Unsupported file type passed to image()");
	}

	if (options.maxSizeBytes && data.byteLength > options.maxSizeBytes) {
		throw new Error(
			`File size exceeds the maximum allowed size of ${options.maxSizeBytes} bytes`,
		);
	}

	try {
		await s3.write(key, data, options);
	} catch (error) {
		console.error(`Failed to upload file to ${key}:`, error);

		throw new Error(
			`Failed to upload file: ${error instanceof Error ? error.message : String(error)}`,
		);
	}

	// Build a public-access URL for the new object
	const baseUrl =
		env.AWS_URL?.replace(/\/$/, "") ??
		(env.AWS_ENDPOINT
			? env.AWS_USE_PATH_STYLE_ENDPOINT
				? `${env.AWS_ENDPOINT.replace(/\/$/, "")}/${env.AWS_BUCKET}`
				: `${env.AWS_ENDPOINT.replace(
						/^https?:\/\//,
						`https://${env.AWS_BUCKET}.`,
					).replace(/\/$/, "")}`
			: `https://${env.AWS_BUCKET}.s3.${env.AWS_REGION ?? "us-east-1"}.amazonaws.com`);

	return `${baseUrl}/${key}`;
}
