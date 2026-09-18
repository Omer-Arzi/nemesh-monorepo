/**
 * Site-wide SEO constants and base URL helper.
 * All SEO helpers and JSON-LD builders in src/lib/seo/ import from here.
 */

export const SITE_NAME = "Nemesh";
export const SITE_ALTERNATE_NAME = "נמש";
export const SITE_LOCALE = "he-IL";

/** Fallback OG image served from /public. Place a 1200×630 px image there. */
export const DEFAULT_OG_IMAGE = "/images/branding/og-default.jpg";

/**
 * Conventional SEO meta-description target length, in characters. Google
 * typically truncates search-result snippets somewhere around 155-160
 * characters; 155 is used as the mechanical, word-boundary-aware truncation
 * length for recipe meta/OG/Twitter descriptions in `generateMetadata()`
 * (see `[slug]/page.tsx`). Not applied to Recipe JSON-LD `description`,
 * which has no equivalent snippet-length convention.
 */
export const META_DESCRIPTION_MAX_LENGTH = 155;

/**
 * Returns the production base URL with no trailing slash. The single,
 * server-safe source of the canonical origin — every sitemap/robots URL,
 * `alternates.canonical`, `openGraph.url`, and JSON-LD `url`/`item` value in
 * this codebase is built from this function, never a hardcoded domain.
 *
 * The fallback is `https://www.nemesh-food.com` (with `www`) because
 * production redirects the bare `nemesh-food.com` domain to `www` with a
 * 308 — `www` is the actual canonical host, not the domain you'd type first.
 * `NEXT_PUBLIC_SITE_URL` in Vercel should be set to the same `www` URL
 * explicitly (see docs/deployment.md); this fallback only covers the case
 * where it isn't.
 */
export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.nemesh-food.com").replace(/\/$/, "");
}
