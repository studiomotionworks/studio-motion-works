import { getPayload } from "payload";
import config from "@/payload.config";

console.log("1. before getPayload");

const payload = await getPayload({ config });

console.log("2. after getPayload");

console.log("3. before find");

const result = await payload.find({
  collection: "events",
  limit: 1,
});

console.log("4. find completed");
console.log(result);

process.exit(0);
