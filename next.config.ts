import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "archive.org", pathname: "/**" },
    ],
  },
};

export default nextConfig;
