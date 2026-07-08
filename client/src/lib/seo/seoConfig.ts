/**
 * Site-wide SEO constants and base URL helper.
 * All SEO helpers and JSON-LD builders in src/lib/seo/ import from here.
 */

export const SITE_NAME = "Nemesh";
export const SITE_ALTERNATE_NAME = "נמש";
export const SITE_LOCALE = "he-IL";

/** Fallback OG image served from /public. Place a 1200×630 px image there. */
export const DEFAULT_OG_IMAGE = "/images/branding/og-default.jpg";

/** Returns the production base URL with no trailing slash.
 *  Set NEXT_PUBLIC_SITE_URL in Vercel / Railway to override the fallback. */
export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://nemesh-food.com").replace(/\/$/, "");
}
