// lib/debug-collections.ts

import { getPayload } from "payload";
import config from "@/payload.config";

console.log("BEFORE PAYLOAD");

const payload = await getPayload({
  config,
});

console.log("AFTER PAYLOAD");

for (const collection of [
  "events",
  "posts",
  "projects",
  // put your fourth collection here
]) {
  console.log(`Testing collection: ${collection}`);

  try {
    const result = await payload.find({
      collection: collection as any,
      limit: 1,
    });

    console.log(`${collection} OK:`, result);
  } catch (error) {
    console.error(`${collection} FAILED:`, error);
  }
}

process.exit(0);
