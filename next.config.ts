import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";
const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["three"],
  // Payload initializes in each page worker; cap concurrency to limit build memory.
  experimental: { cpus: 2 },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-2539627c437e4a2a84e8f31a54e40954.r2.dev",
      },
    ],
  },
};

export default withPayload(nextConfig);
