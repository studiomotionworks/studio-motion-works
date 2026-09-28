import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { fileURLToPath } from "url";

import { Users } from "./collections/Users";
import { Events } from "./collections/Events";
import { Projects } from "./collections/Projects";
import { Posts } from "./collections/Posts";

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
  collections: [Users, Events, Posts, Projects],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || "",
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || "",
    },
  }),
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
    autoGenerate: false,
  },
});
