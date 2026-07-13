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
import type { HomePage, HomepageAbout } from "@/types/domain";
import type { BlockNode } from "@/types/domain";
import { apiClient } from "../client";
import { mapImage, type StrapiMediaRaw } from "../mappers";

// ─── Internal Strapi wire types ────────────────────────────────────────────

type StrapiAboutSection = {
  id?: number;
  title: string | null;
  body: BlockNode[] | null;
  image: StrapiMediaRaw | null;
};

type StrapiHomepageAttrs = {
  heroTitle: string | null;
  heroSubtitle: string | null;
  heroBackgroundImage: StrapiMediaRaw | null;
  latestRecipesTitle: string | null;
  featuredCategoriesTitle: string | null;
  about: StrapiAboutSection | null;
};

// ─── Mappers ──────────────────────────────────────────────────────────────

function mapAbout(raw: StrapiAboutSection | null | undefined): HomepageAbout | null {
  if (!raw) return null;
  const image = mapImage(raw.image);
  if (!image) return null;
  return {
    title: raw.title?.trim() || null,
    body: raw.body ?? [],
    image,
  };
}

function mapHomepage(raw: StrapiData<StrapiHomepageAttrs>): HomePage {
  return {
    heroTitle: raw.heroTitle ?? null,
    heroSubtitle: raw.heroSubtitle ?? null,
    heroBackgroundImage: mapImage(raw.heroBackgroundImage),
    latestRecipesTitle: raw.latestRecipesTitle ?? null,
    featuredCategoriesTitle: raw.featuredCategoriesTitle ?? null,
    about: mapAbout(raw.about),
  };
}

// ─── Public API ───────────────────────────────────────────────────────────

export async function getHomepage(): Promise<HomePage | null> {
  try {
    const raw = await apiClient.get<StrapiSingle<StrapiHomepageAttrs>>(
      "/homepage?populate[heroBackgroundImage]=true&populate[about][populate][image]=true"
    );
    return mapHomepage(raw.data);
  } catch (err) {
    const apiErr = err as { status?: number };
    if (apiErr?.status === 404) return null;
    throw err;
  }
}
