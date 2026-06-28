import type { Image } from "@/types/domain";

// Strapi serves media from its own origin, not from /api — strip the suffix so
// relative /uploads/... paths resolve to the server root, not /api/uploads/...
const STRAPI_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:1337/api"
).replace(/\/api\/?$/, "");

export function resolveImageUrl(rawUrl: string | null | undefined): string | undefined {
  if (!rawUrl) return undefined;
  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) return rawUrl;
  return `${STRAPI_ORIGIN}${rawUrl}`;
}

export function getImageUrl(image: Image | null | undefined): string | undefined {
  return resolveImageUrl(image?.url);
}
