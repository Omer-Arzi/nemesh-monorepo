/**
 * About page service — fetches the dedicated About page single type.
 *
 * Distinct from homepageService's HomepageAbout (the shorter homepage teaser)
 * — this is the full About page's own content, never shared with it.
 *
 * eyebrow and title are optional. content and both images are required by
 * the Strapi schema; getAboutPage() returns null for the whole entry if any
 * of those is missing or fails to map, rather than rendering a partial page
 * — see AboutPage's domain type doc for why.
 *
 * Permissions: enable "find" for about-page in Strapi:
 *   Settings → Users & Permissions → Roles → Public → about-page → find ✓
 */
import type { StrapiSingle, StrapiData } from "@/types/api";
import type { AboutPage, BlockNode } from "@/types/domain";
import { apiClient } from "../client";
import { mapImage, type StrapiMediaRaw } from "../mappers";

// ─── Internal wire type ───────────────────────────────────────────────────

type StrapiAboutPageAttrs = {
  eyebrow: string | null;
  title: string | null;
  content: BlockNode[] | null;
  primaryImage: StrapiMediaRaw | null;
  secondaryImage: StrapiMediaRaw | null;
};

// ─── Mapper ───────────────────────────────────────────────────────────────

function mapAboutPage(raw: StrapiData<StrapiAboutPageAttrs>): AboutPage | null {
  if (!raw.content || raw.content.length === 0) return null;

  const primaryImage = mapImage(raw.primaryImage);
  const secondaryImage = mapImage(raw.secondaryImage);
  if (!primaryImage || !secondaryImage) return null;

  return {
    eyebrow: raw.eyebrow?.trim() || null,
    title: raw.title?.trim() || null,
    content: raw.content,
    primaryImage,
    secondaryImage,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────

export async function getAboutPage(): Promise<AboutPage | null> {
  try {
    const raw = await apiClient.get<StrapiSingle<StrapiAboutPageAttrs>>(
      "/about-page?populate[primaryImage]=true&populate[secondaryImage]=true",
      { next: { revalidate: 300 } }
    );
    return mapAboutPage(raw.data);
  } catch (err) {
    const apiErr = err as { status?: number };
    if (apiErr?.status === 404) return null;
    throw err;
  }
}
