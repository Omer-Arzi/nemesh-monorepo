/**
 * Server-only fetches for the site-setting single type.
 *
 * `getSiteSettings()` is the primary export — it fetches the full document
 * (theme key + branding logos) in one request and returns both.
 * `getActiveThemeKey()` is kept as a convenience wrapper for callers that
 * only need the theme preset.
 *
 * Permissions: enable "find" for site-setting in Strapi:
 *   Settings → Users & Permissions → Roles → Public → site-setting → find ✓
 *
 * In development: no caching + console logs at every step.
 * In production: ISR with 5-minute revalidation.
 */
import { isValidPresetKey, type ThemePresetKey } from "@/lib/theme/themePresets";
import type { SiteBranding } from "@/types/domain";
import { mapImage, type StrapiMediaRaw } from "../mappers";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:1337/api";
const IS_DEV = process.env.NODE_ENV === "development";

// ─── Internal wire type ───────────────────────────────────────────────────────

type StrapiSiteSettingRaw = {
  activeThemeKey?: unknown;
  logo?: StrapiMediaRaw | null;
  mobileLogo?: StrapiMediaRaw | null;
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetches the full site-setting document. Returns null-safe defaults on any
 * failure so the page always renders with the built-in fallbacks.
 */
export async function getSiteSettings(): Promise<{
  activeThemeKey: ThemePresetKey | null;
  branding: SiteBranding;
}> {
  const url = `${API_BASE}/site-setting?populate[logo]=true&populate[mobileLogo]=true`;

  if (IS_DEV) console.log(`[Nemesh settings] Fetching: ${url}`);

  try {
    const res = await fetch(
      url,
      IS_DEV ? { cache: "no-store" } : { next: { revalidate: 300 } }
    );

    if (IS_DEV) console.log(`[Nemesh settings] Response: ${res.status}`);

    if (!res.ok) {
      if (IS_DEV) {
        const body = await res.text().catch(() => "(unreadable)");
        console.warn(
          `[Nemesh settings] ❌ ${res.status} from ${url}\n` +
            `  Body: ${body}\n` +
            (res.status === 403
              ? '  Fix: Settings → Roles → Public → site-setting → enable "find"'
              : res.status === 404
                ? "  Fix: Open Site Settings in Strapi admin and click Save."
                : "  Falling back to defaults.")
        );
      }
      return { activeThemeKey: null, branding: { logo: null, mobileLogo: null } };
    }

    const data: unknown = await res.json();
    const attrs = (data as { data?: StrapiSiteSettingRaw })?.data;
    const key = attrs?.activeThemeKey;

    const activeThemeKey = isValidPresetKey(key) ? key : null;
    const branding: SiteBranding = {
      logo: mapImage(attrs?.logo ?? null),
      mobileLogo: mapImage(attrs?.mobileLogo ?? null),
    };

    if (IS_DEV) {
      console.log(`[Nemesh settings] ✅ theme="${activeThemeKey}", logo=${branding.logo ? "✓" : "–"}, mobileLogo=${branding.mobileLogo ? "✓" : "–"}`);
    }

    return { activeThemeKey, branding };
  } catch (err) {
    if (IS_DEV) console.error(`[Nemesh settings] ❌ Fetch threw:`, err);
    return { activeThemeKey: null, branding: { logo: null, mobileLogo: null } };
  }
}

/** Convenience wrapper — returns only the theme preset key. */
export async function getActiveThemeKey(): Promise<ThemePresetKey | null> {
  return (await getSiteSettings()).activeThemeKey;
}
