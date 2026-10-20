import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { fileURLToPath } from "url";
import { s3Storage } from "@payloadcms/storage-s3";
import sharp from "sharp";

import { Users } from "./collections/Users";
import { Events } from "./collections/Events";
import { Projects } from "./collections/Projects";
import { Posts } from "./collections/Posts";
import { Media } from "./collections/Media";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
export default buildConfig({
  // Security through Obscurity: Change the default /admin route
  routes: {
    admin: "/portal-access-key", // Change this to your preferred secret URL path
  },
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Events, Posts, Projects, Media],
  editor: lexicalEditor({}),
  sharp,
  secret: process.env.PAYLOAD_SECRET || "",
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || "",
    },
  }),
  plugins: [
    s3Storage({
      collections: {
        media: {
          prefix: "media",
          // Serve from your public R2 domain instead of the signed S3 endpoint
          generateFileURL: ({ filename, prefix }) =>
            `${process.env.R2_PUBLIC_URL}/${prefix}/${filename}`,
        },
      },
      bucket: process.env.R2_BUCKET!,
      clientUploads: true, // browser uploads straight to R2, which avoids Vercel's ~4.5 MB body limit
      config: {
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        region: "auto",
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID!,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
        },
      },
    }),
  ],
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
    autoGenerate: false,
  },
});
