import { getPayload } from "payload";
import config from "@/payload.config";

console.log("1. File loaded");

console.log("2. Config imported");
console.log("Config type:", typeof config);

console.log("3. Starting getPayload...");

const start = Date.now();

const payload = await getPayload({
  config,
});

console.log("4. getPayload completed");
console.log("Took:", Date.now() - start, "ms");
console.log("Payload:", !!payload);

process.exit(0);
