import { buildConfig } from "payload";
import { sqliteD1Adapter } from "@payloadcms/db-d1-sqlite";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { fileURLToPath } from "url";
import { s3Storage } from "@payloadcms/storage-s3";
import { groupedMediaStorage } from "./lib/grouped-media-storage";

import { Users } from "./collections/Users";
import { Events } from "./collections/Events";
import { Projects } from "./collections/Projects";
import { Posts } from "./collections/Posts";
import { Media } from "./collections/Media";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
// Payload's CLI runs outside Next.js. Use Wrangler's local D1 there; remote
// migrations opt in explicitly with CLOUDFLARE_ENV=remote.
const isPayloadCLI = process.argv.some((arg) => /[\\/]payload[\\/]bin\.js$/.test(arg));
const cloudflare = isPayloadCLI
  ? await import(/* webpackIgnore: true */ `${"__wrangler".replaceAll("_", "")}`).then(
      ({ getPlatformProxy }) => getPlatformProxy({ environment: process.env.CLOUDFLARE_ENV }),
    )
  : await getCloudflareContext({ async: true });

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
  secret: process.env.PAYLOAD_SECRET || "",
  db: sqliteD1Adapter({
    binding: cloudflare.env.D1,
    migrationDir: path.resolve(dirname, "migrations/d1"),
    // Apply reviewed migrations explicitly, including in development.
    push: false,
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
      clientUploads: true, // browser uploads straight to R2
      config: {
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        region: "auto",
        forcePathStyle: true,
        // The browser supplies the body after signing. Do not sign the SDK's
        // default checksum for an empty body into image/video upload URLs.
        requestChecksumCalculation: "WHEN_REQUIRED",
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID!,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
        },
      },
    }),
    groupedMediaStorage,
  ],
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
    autoGenerate: false,
  },
});
