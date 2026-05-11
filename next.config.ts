import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization & remote image hosts
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.microcms-assets.io" },
      { protocol: "https", hostname: "hitokara.microcms.io" },
    ],
    // Default to modern formats; Next.js will pick AVIF/WebP based on browser support
    formats: ["image/avif", "image/webp"],
    // Common breakpoints used in <Image sizes="...">
    deviceSizes: [360, 414, 640, 750, 828, 1080, 1200, 1600, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 480, 720],
    // Cache optimized images for 1 year (immutable since URL contains content hash)
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },

  // Compress responses (default true; explicit for clarity)
  compress: true,

  // Production-only: stronger HTTP cache headers for static assets
  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:all*(woff|woff2|ttf|otf)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
