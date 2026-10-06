import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/chat/:id",
        destination: "/rooms/:id",
      },
      {
        source: "/buzz/:id",
        destination: "/buzz",
      },
    ];
  },
};

export default nextConfig;
