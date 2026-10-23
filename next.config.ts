import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Menu photos can come from any link or upload, so skip host checks.
    unoptimized: true,
  },
};

export default nextConfig;
