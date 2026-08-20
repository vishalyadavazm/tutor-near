import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL;

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  async rewrites() {
    if (!BACKEND_URL) return [];

    return [
      {
        source: "/api/proxy/:path*",
        destination: `${BACKEND_URL}/v1/api/:path*`,
      },
      {
        source: "/media/:path*",
        destination: `${BACKEND_URL}/media/:path*`,
      },
    ];
  },
};

export default nextConfig;
