// collections/Media.ts
import type { CollectionConfig } from "payload";
import { moveMediaFolder } from "../lib/move-media-folder";
import { contentRevalidationHooks } from "../lib/revalidate-content";

export const Media: CollectionConfig = {
  slug: "media",
  hooks: { afterChange: [contentRevalidationHooks.afterChange], afterDelete: [contentRevalidationHooks.afterDelete] },
  access: { read: () => true },
  endpoints: [{ path: "/:id/move-folder", method: "post", handler: moveMediaFolder }],
  upload: {
    mimeTypes: ["image/*", "video/mp4", "video/webm"],
    // Store one original object per upload; no generated thumbnail/card objects.
    focalPoint: false,
    // Workers cannot load native sharp. Keep uploads as their original files.
    crop: false,
  },
  fields: [
    { name: "alt", type: "text" },
    {
      name: "prefix",
      label: "Media folder",
      type: "text",
      defaultValue: "media/library",
      admin: {
        hidden: false,
        readOnly: false,
        description: "Set from the project, event, or post title. You can choose another folder before uploading, or move a saved file using Move to folder.",
        components: { Field: "/components/admin/MediaUploadField#MediaFolderField" },
      },
    },
  ],
};
