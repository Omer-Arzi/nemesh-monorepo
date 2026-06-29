import { isValidPresetKey, type ThemePresetKey } from "@/lib/theme/themePresets";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:1337/api";
const IS_DEV = process.env.NODE_ENV === "development";

/**
 * Server-only fetch — do not import this in Client Components.
 *
 * Fetches the active theme key from the Strapi site-setting single type.
 * Returns null on any failure so callers can fall back to classic theme.
 *
 * In development: no caching (cache: "no-store") + console logs at every step
 * so the exact failure point is always visible in the Next.js terminal.
 *
 * In production: ISR with 1-hour revalidation (theme changes are rare and the
 * classic fallback is safe).
 *
 * Common failure reasons and how to fix them:
 *   403 Forbidden  → Enable "find" for site-setting in Strapi:
 *                    Settings → Users & Permissions → Roles → Public → site-setting → find ✓
 *   404 NotFound   → The site-setting document hasn't been saved in the admin yet.
 *                    Open Content Manager → Site Settings → save the document.
 *   Unknown key    → The Strapi activeThemeKey value doesn't match a frontend preset.
 *                    Valid values: "classic", "freckleWarm".
 */
export async function getActiveThemeKey(): Promise<ThemePresetKey | null> {
  const url = `${API_BASE}/site-setting`;

  if (IS_DEV) {
    console.log(`[Nemesh theme] Fetching site-setting from: ${url}`);
  }

  try {
    const res = await fetch(url, IS_DEV ? { cache: "no-store" } : { next: { revalidate: 3600 } });

    if (IS_DEV) {
      console.log(`[Nemesh theme] Response status: ${res.status}`);
    }

    if (!res.ok) {
      if (IS_DEV) {
        const body = await res.text().catch(() => "(unreadable)");
        console.warn(
          `[Nemesh theme] ❌ ${res.status} from ${url}\n` +
          `  Body: ${body}\n` +
          (res.status === 403
            ? "  Fix: Settings → Users & Permissions → Roles → Public → site-setting → enable \"find\""
            : res.status === 404
            ? "  Fix: Open Content Manager → Site Settings in Strapi admin and click Save."
            : "  Falling back to classic theme.")
        );
      }
      return null;
    }

    const data: unknown = await res.json();
    const key: unknown = (data as { data?: { activeThemeKey?: unknown } })?.data?.activeThemeKey;

    if (IS_DEV) {
      console.log(`[Nemesh theme] activeThemeKey from Strapi: ${JSON.stringify(key)}`);
    }

    if (!isValidPresetKey(key)) {
      if (IS_DEV) {
        console.warn(
          `[Nemesh theme] ⚠️  Unknown activeThemeKey "${String(key)}". ` +
          `Valid values: "classic", "freckleWarm". Falling back to classic.`
        );
      }
      return null;
    }

    if (IS_DEV) {
      console.log(`[Nemesh theme] ✅ Resolved preset: "${key}"`);
    }

    return key;
  } catch (err) {
    if (IS_DEV) {
      console.error(`[Nemesh theme] ❌ Fetch threw:`, err);
    }
    return null;
  }
}
