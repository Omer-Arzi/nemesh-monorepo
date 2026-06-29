/**
 * Homepage service — fetches static single-type page content.
 *
 * All fields are optional in Strapi. Returns null on fetch/404 failure so
 * the page falls back to hardcoded Hebrew defaults without a loading state.
 *
 * Permissions: enable "find" for homepage in Strapi:
 *   Settings → Users & Permissions → Roles → Public → homepage → find ✓
 */
import type { StrapiSingle, StrapiData } from "@/types/api";
import type { HomePage } from "@/types/domain";
import { apiClient } from "../client";
import { mapImage, type StrapiMediaRaw } from "../mappers";

// ─── Internal Strapi wire types ────────────────────────────────────────────

type StrapiHomepageAttrs = {
  heroTitle: string | null;
  heroSubtitle: string | null;
  heroBackgroundImage: StrapiMediaRaw | null;
  latestRecipesTitle: string | null;
  featuredCategoriesTitle: string | null;
};

// ─── Mapper ───────────────────────────────────────────────────────────────

function mapHomepage(raw: StrapiData<StrapiHomepageAttrs>): HomePage {
  return {
    heroTitle: raw.heroTitle ?? null,
    heroSubtitle: raw.heroSubtitle ?? null,
    heroBackgroundImage: mapImage(raw.heroBackgroundImage),
    latestRecipesTitle: raw.latestRecipesTitle ?? null,
    featuredCategoriesTitle: raw.featuredCategoriesTitle ?? null,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────

export async function getHomepage(): Promise<HomePage | null> {
  try {
    const raw = await apiClient.get<StrapiSingle<StrapiHomepageAttrs>>(
      "/homepage?populate[heroBackgroundImage]=true"
    );
    return mapHomepage(raw.data);
  } catch (err) {
    const apiErr = err as { status?: number };
    if (apiErr?.status === 404) return null;
    throw err;
  }
}
