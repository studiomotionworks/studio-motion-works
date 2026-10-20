// collections/Media.ts
import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  access: { read: () => true },
  upload: {
    mimeTypes: ["image/*", "video/mp4", "video/webm"],
    // Resizing applies to images only; videos are stored as-is
    imageSizes: [
      { name: "thumb", width: 400 },
      { name: "card", width: 900 },
    ],
  },
  fields: [{ name: "alt", type: "text" }],
};
