import { getPayload } from "payload";
import config from "../payload.config";

const payload = await getPayload({ config });
for (const collection of ["users", "media", "posts", "projects", "events"] as const) {
  const result = await payload.find({ collection, limit: 100, depth: 2, overrideAccess: true });
  if (collection === "media") {
    for (const media of result.docs) {
      if (!("filename" in media) || !media.filename) continue;
      if (!("url" in media) || !media.url || !URL.canParse(media.url)) throw new Error("A migrated media URL is invalid.");
    }
  }
  console.log(`${collection}: ${result.totalDocs} records readable through Payload with relationships populated.`);
}
