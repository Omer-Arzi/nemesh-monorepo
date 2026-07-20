import type { NextConfig } from "next";

// Derive the Strapi server origin from the API base URL (strip /api suffix).
// This covers uploads served directly by Strapi in production.
const strapiOrigin = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:1337/api"
).replace(/\/api\/?$/, "");

// NEXT_PUBLIC_IMAGE_HOST controls the S3/CDN hostname.
// Changing CDN providers only requires updating this env var, not the codebase.
const imageHost = process.env.NEXT_PUBLIC_IMAGE_HOST;

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  // Local Strapi in development (http://localhost:1337/uploads/...)
  { protocol: "http", hostname: "localhost" },
];

// Add the production Strapi server hostname so relative-URL images still resolve
// correctly during / after S3 migration (some records may still carry relative paths).
try {
  const { hostname, protocol } = new URL(strapiOrigin);
  if (hostname !== "localhost") {
    remotePatterns.push({
      protocol: protocol.replace(":", "") as "http" | "https",
      hostname,
    });
  }
} catch {
  // NEXT_PUBLIC_API_URL not set or malformed; localhost fallback covers dev.
}

// S3 / CDN: set NEXT_PUBLIC_IMAGE_HOST to the bucket or distribution hostname.
if (imageHost) {
  remotePatterns.push({ protocol: "https", hostname: imageHost });
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Lets the dev server accept requests (including HMR) from a tunnel host
  // (e.g. ngrok) when testing this dev server from another device. Server-only
  // config value — no NEXT_PUBLIC_ prefix needed, it's never sent to the browser.
  allowedDevOrigins: process.env.DEV_TUNNEL_HOST ? [process.env.DEV_TUNNEL_HOST] : undefined,
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
