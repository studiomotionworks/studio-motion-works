import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, type S3Client } from "@aws-sdk/client-s3";
import { APIError, Forbidden, type PayloadHandler, type Where } from "payload";
import type { Media } from "../payload-types";
import { normalizeMediaUploadFolder } from "./media-folders";
import { assertMediaKeyAvailable, getMediaStorageClient } from "./grouped-media-storage";

export const createMediaFolderMover = (getClient: () => S3Client = getMediaStorageClient): PayloadHandler => async (req) => {
  if (!req.user) throw new Forbidden();
  const id = Number(req.routeParams?.id);
  if (!Number.isSafeInteger(id) || id <= 0) throw new APIError("A valid media ID is required.", 400);
  const body = await req.json!() as Record<string, unknown>;
  if (!body || typeof body !== "object" || typeof body.prefix !== "string" ||
    (body.alt != null && typeof body.alt !== "string")) throw new APIError("Invalid media folder details.", 400);
  const { prefix: requestedPrefix, alt } = body as { prefix: string; alt?: string | null };
  let prefix: string;
  try {
    prefix = normalizeMediaUploadFolder(requestedPrefix);
  } catch {
    throw new APIError("Enter a valid media folder.", 400);
  }
  const mediaConfig = req.payload.collections.media.config;
  const access = await mediaConfig.access.update({ req, id, data: { prefix } });
  if (!access) throw new Forbidden();
  if (typeof access === "object") {
    const allowed = await req.payload.find({
      collection: "media", req, depth: 0, limit: 1, overrideAccess: true,
      where: { and: [access as Where, { id: { equals: id } }] },
    });
    if (!allowed.docs.length) throw new Forbidden();
  }
  const doc = await req.payload.findByID({ collection: "media", id, req, depth: 0, overrideAccess: false });
  if (!doc.filename) throw new APIError("This media has no stored file.", 400);
  const oldFolder = [doc.prefix || "media", doc._objectKey].filter(Boolean).join("/");
  if (oldFolder === prefix) return Response.json({ doc });

  const client = getClient();
  const bucket = process.env.R2_BUCKET!;
  const filenames = [...new Set([
    doc.filename,
    ...Object.values(doc.sizes || {}).map((size) => size?.filename).filter((name): name is string => Boolean(name)),
  ])];
  for (const filename of filenames) await assertMediaKeyAvailable(client, `${prefix}/${filename}`);

  const written: string[] = [];
  let updated: Media;
  try {
    for (const filename of filenames) {
      const source = await client.send(new GetObjectCommand({ Bucket: bucket, Key: `${oldFolder}/${filename}` }));
      await client.send(new PutObjectCommand({
        Bucket: bucket, Key: `${prefix}/${filename}`, Body: source.Body,
        ContentLength: source.ContentLength, ContentType: source.ContentType,
        CacheControl: source.CacheControl, ContentDisposition: source.ContentDisposition,
        IfNoneMatch: "*",
      }));
      written.push(`${prefix}/${filename}`);
    }
    // Update access was checked above. Only trusted server code changes stored identity.
    // The Local API commits its transaction before returning, while sources still exist.
    updated = await req.payload.update({
      collection: "media", id, req, depth: 0, overrideAccess: true, overrideLock: false,
      data: { prefix, _objectKey: "", ...(typeof alt === "string" ? { alt } : {}) },
    });
  } catch (error) {
    await Promise.allSettled(written.map((key) => client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))));
    throw error;
  }

  // Only remove sources once metadata points to the successfully written destination.
  for (const filename of filenames) {
    try {
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: `${oldFolder}/${filename}` }));
    } catch (error) {
      req.payload.logger.error({ err: error, msg: "Media moved, but its old storage object could not be removed." });
    }
  }
  return Response.json({ doc: updated });
};

export const moveMediaFolder = createMediaFolderMover();
