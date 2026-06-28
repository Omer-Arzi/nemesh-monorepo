/**
 * Shir Challenge Page service — fetches static single-type page content only.
 * Monthly challenge data is fetched separately via shirChallengeMonthService.
 */
import type { StrapiSingle, StrapiData } from "@/types/api";
import type { ShirChallengePage } from "@/types/domain";
import { apiClient } from "../client";
import { mapImage, type StrapiMediaRaw } from "../mappers";

// ─── Internal Strapi wire types ────────────────────────────────────────────

type StrapiShirChallengePageAttrs = {
  title: string | null;
  badgeText: string | null;
  subtitle: string | null;
  heroImage: StrapiMediaRaw | null;
};

// ─── Mapper ───────────────────────────────────────────────────────────────

function mapShirChallengePage(
  raw: StrapiData<StrapiShirChallengePageAttrs>
): ShirChallengePage {
  return {
    title: raw.title ?? null,
    badgeText: raw.badgeText ?? null,
    subtitle: raw.subtitle ?? null,
    heroImage: mapImage(raw.heroImage),
  };
}

// ─── Public API ───────────────────────────────────────────────────────────

/**
 * Fetches the shir-challenge-page single type.
 * Returns null if the document has not been saved yet in admin.
 */
export async function getShirChallengePage(): Promise<ShirChallengePage | null> {
  try {
    const raw = await apiClient.get<StrapiSingle<StrapiShirChallengePageAttrs>>(
      "/shir-challenge-page?populate[heroImage]=true"
    );
    return mapShirChallengePage(raw.data);
  } catch (err) {
    const apiErr = err as { status?: number };
    if (apiErr?.status === 404) return null;
    throw err;
  }
}
