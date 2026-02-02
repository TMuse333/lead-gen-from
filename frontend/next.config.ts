import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow iframe embedding for the bot pages
  async headers() {
    return [
      {
        // Apply to bot pages for iframe embedding
        source: '/bot/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
