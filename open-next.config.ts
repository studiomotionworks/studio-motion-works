import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// CMS pages render on request, so deployment doesn't need an ISR cache bucket.
export default defineCloudflareConfig({});
