import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();
const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["three"],
  serverExternalPackages: ["jose"],
  // Payload initializes in each page worker; cap concurrency to limit build memory.
  experimental: {
    cpus: 2,
    serverActions: { allowedOrigins: ["motionworks.in", "www.motionworks.in"] },
  },
  images: {
    // Serve originals from R2; no paid Cloudflare Images binding is required.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-2539627c437e4a2a84e8f31a54e40954.r2.dev",
      },
    ],
  },
};

const payloadConfig = withPayload(nextConfig);
const payloadWebpack = payloadConfig.webpack;

export default {
  ...payloadConfig,
  webpack(config, context) {
    const result = payloadWebpack ? payloadWebpack(config, context) : config;
    // These are CLI/native-only dependencies. Neither schema generation nor
    // sharp image processing runs in the deployed Worker. Keep them out of the
    // server bundle as well as Next's file traces.
    result.externals = result.externals.filter((entry: unknown) =>
      typeof entry !== "string" || !["sharp", "drizzle-kit", "drizzle-kit/api"].includes(entry),
    );
    result.resolve.alias = {
      ...result.resolve.alias,
      sharp: false,
      "drizzle-kit": false,
    };
    return result;
  },
} satisfies NextConfig;
