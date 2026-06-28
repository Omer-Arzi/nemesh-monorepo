import type { NextConfig } from "next";

// NEXT_PUBLIC_IMAGE_HOST controls which remote hostname Next.js Image is allowed
// to optimise. Set this to the S3 bucket hostname (or CloudFront/CDN domain) in
// your deployment environment. Changing CDN providers only requires updating this
// variable — no code changes needed.
const imageHost = process.env.NEXT_PUBLIC_IMAGE_HOST;

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  // Allow local Strapi uploads in development (http://localhost:1337/uploads/...)
  { protocol: "http", hostname: "localhost" },
];

if (imageHost) {
  remotePatterns.push({ protocol: "https", hostname: imageHost });
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,

  images: {
    remotePatterns,
    // Next.js Image blocks private IPs (SSRF protection, added in 14.1.1).
    // In development, Strapi serves images from localhost which resolves to ::1/127.0.0.1.
    // unoptimized bypasses the optimizer in dev — no server-side fetch, no IP check.
    // Production uses S3 (public IP) so optimization stays fully active.
    unoptimized: process.env.NODE_ENV !== "production",
  },
};

export default nextConfig;
