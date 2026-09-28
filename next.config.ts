import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";
const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["three"],
};

export default withPayload(nextConfig);