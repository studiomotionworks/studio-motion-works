import { revalidatePath } from "next/cache";
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, PayloadRequest } from "payload";

export function createContentRevalidationHooks(refresh = revalidatePath) {
  const invalidate = (collection: string, req: PayloadRequest, slug?: string, previousSlug?: string) => {
    try {
      if (collection === "projects" || collection === "media") refresh("/gallery-motions");
      if (collection === "events" || collection === "media") refresh("/events");
      if (collection === "posts" || collection === "media") {
        refresh("/blog");
        if (collection === "media") refresh("/blog/[slug]", "page");
        else {
          for (const value of new Set([slug, previousSlug])) {
            if (value) refresh(`/blog/${value}`);
          }
        }
      }
    } catch (error) {
      // CLI imports/seeding have no Next request context. A cache failure must
      // never turn an already completed content save into an apparent failure.
      req.payload.logger.warn({ err: error, msg: "Content saved, but public page cache could not be refreshed." });
    }
  };

  const afterChange: CollectionAfterChangeHook = ({ collection, doc, previousDoc, req }) => {
    invalidate(collection.slug, req, doc.slug, previousDoc?.slug);
    return doc;
  };
  const afterDelete: CollectionAfterDeleteHook = ({ collection, doc, req }) => {
    invalidate(collection.slug, req, doc.slug);
    return doc;
  };
  return { afterChange, afterDelete };
}

export const contentRevalidationHooks = createContentRevalidationHooks();
