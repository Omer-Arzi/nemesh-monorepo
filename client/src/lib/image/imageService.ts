import type { Image } from "@/types/domain";

/**
 * Returns the absolute URL for a domain Image, or undefined if no image is provided.
 *
 * This is the single point of truth for resolving display URLs from the Image domain type.
 * URL resolution from raw Strapi paths happens earlier, in src/lib/api/mappers.ts.
 * CDN migration or URL transformation should be done here, not in components.
 */
export function getImageUrl(image: Image | null | undefined): string | undefined {
  return image?.url || undefined;
}
