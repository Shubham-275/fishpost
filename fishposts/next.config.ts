import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "imgflip.com",
      },
      {
        protocol: "https",
        hostname: "i.imgflip.com",
      },
    ],
  },
};

export default nextConfig;
