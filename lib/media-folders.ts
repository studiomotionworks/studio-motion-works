export const MEDIA_LIBRARY_FOLDER = "media/library";

export function mediaFolderForRecord(collection: string | undefined, title: unknown): string | null {
  if (!collection || !["projects", "events", "posts"].includes(collection)) return null;
  if (typeof title !== "string") return null;
  const name = title.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return name ? `media/${collection}/${name}` : null;
}

export function normalizeMediaUploadFolder(value: unknown): string {
  if (value === undefined || value === null || value === "" || value === "media") {
    return MEDIA_LIBRARY_FOLDER;
  }
  if (typeof value !== "string" || !/^media\/(?:library(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)?|(?:projects|events|posts)\/[a-z0-9]+(?:-[a-z0-9]+)*)$/.test(value)) {
    throw new Error("Use media/library or media/projects, media/events, or media/posts followed by the record slug.");
  }
  return value;
}
