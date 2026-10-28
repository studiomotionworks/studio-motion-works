import { HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { APIError, type PayloadHandler, type Plugin } from "payload";
import { assertClientUploadAccess, assertClientUploadAllowed, assertClientUploadFileSize, createClientUploadReceipt } from "payload/internal";
import { getSanitizedUploadFilename } from "payload/shared";
import { normalizeMediaUploadFolder } from "./media-folders";

let client: S3Client | undefined;
export function getMediaStorageClient() {
  return client ??= new S3Client({
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    region: "auto",
    forcePathStyle: true,
    requestChecksumCalculation: "WHEN_REQUIRED",
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

export async function assertMediaKeyAvailable(client: S3Client, key: string) {
  try {
    await client.send(new HeadObjectCommand({ Bucket: process.env.R2_BUCKET!, Key: key }));
  } catch (error) {
    if (error instanceof Error && (error.name === "NotFound" || error.name === "NoSuchKey" || ("$metadata" in error && (error.$metadata as { httpStatusCode?: number })?.httpStatusCode === 404))) return;
    throw error;
  }
  throw new APIError("A file with this name already exists in that folder. Choose a different folder or remove the existing media first.", 409);
}

export const createMediaUploadSigner = (getClient = getMediaStorageClient): PayloadHandler => async (req) => {
  const body = await req.json!() as Record<string, unknown>;
  if (!body || typeof body !== "object" || typeof body.filename !== "string" ||
    typeof body.mimeType !== "string" || typeof body.filesize !== "number") {
    throw new APIError("Invalid upload details.", 400);
  }
  const { collectionSlug, docPrefix, filename, filesize, mimeType } = body as {
    collectionSlug: string; docPrefix: string; filename: string; filesize: number; mimeType: string;
  };
  if (collectionSlug !== "media") throw new APIError("Invalid upload collection.", 400);
  await assertClientUploadAccess({ collectionSlug, req });
  assertClientUploadAllowed({ collection: req.payload.collections.media.config, filename, mimeType });
  assertClientUploadFileSize(filesize);

  let prefix: string;
  try {
    prefix = normalizeMediaUploadFolder(docPrefix);
  } catch {
    throw new APIError("Invalid media folder. Use media/library or media/projects, media/events, or media/posts followed by the record slug.", 400);
  }

  const limit = req.payload.config.upload.limits?.fileSize;
  if (limit && Number.isFinite(limit) && filesize > limit) {
    throw new APIError("The file exceeds the configured upload size limit.", 400);
  }
  const sanitizedFilename = getSanitizedUploadFilename(filename);
  const existing = await req.payload.db.findOne({
    collection: "media", req,
    where: { and: [{ prefix: { equals: prefix } }, { filename: { equals: sanitizedFilename } }] },
  });
  if (existing) throw new APIError("A file with this name already exists in that folder. Choose a different folder or remove the existing media first.", 409);
  await assertMediaKeyAvailable(getClient(), `${prefix}/${sanitizedFilename}`);
  // Explicitly clear legacy UUID folders when replacing a file on an old Media doc.
  const context = { prefix, _objectKey: "" };
  const signedReceipt = createClientUploadReceipt({ collectionSlug, context, filename: sanitizedFilename, req });
  const url = await getSignedUrl(getClient(), new PutObjectCommand({
    Bucket: process.env.R2_BUCKET!,
    Key: `${prefix}/${sanitizedFilename}`,
    ContentType: mimeType,
    ContentLength: limit && Number.isFinite(limit) ? filesize : undefined,
    IfNoneMatch: "*",
  }), {
    expiresIn: 600,
    signableHeaders: new Set(["content-type", ...(limit && Number.isFinite(limit) ? ["content-length"] : [])]),
  });

  return Response.json({
    url,
    filename: sanitizedFilename,
    docPrefix: prefix,
    clientUploadContext: { ...context, signedReceipt },
    headers: { "Content-Length": String(filesize), "Content-Type": mimeType, "If-None-Match": "*" },
  });
};

export const signGroupedMediaUpload = createMediaUploadSigner();

// Run after s3Storage; retain its uploader, receipt validation, reads, and cleanup.
export const groupedMediaStorage: Plugin = (config) => {
  const endpoint = config.endpoints?.find((entry) => entry.path === "/storage-s3-generate-signed-url" && entry.method === "post");
  if (!endpoint) throw new Error("Configure groupedMediaStorage after s3Storage with clientUploads enabled.");
  endpoint.handler = signGroupedMediaUpload;
  return config;
};
