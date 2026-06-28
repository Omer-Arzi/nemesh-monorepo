/**
 * Shir Challenge Page service — fetches the single-type admin content.
 * Returns null when the document has never been saved in Strapi admin.
 */
import type { StrapiSingle, StrapiData } from "@/types/api";
import type { ShirChallengePage, ChallengeIntroStep, MyProgressStatus } from "@/types/domain";
import { apiClient } from "../client";
import { mapImage, type StrapiMediaRaw } from "../mappers";

// ─── Internal Strapi wire types ────────────────────────────────────────────

type StrapiIntroStepRaw = {
  id: number;
  title: string;
  description: string;
};

type StrapiShirChallengePageAttrs = {
  title: string | null;
  badgeText: string | null;
  subtitle: string | null;
  heroImage: StrapiMediaRaw | null;
  monthlyIngredientName: string | null;
  monthlyIngredientDescription: string | null;
  monthLabel: string | null;
  myProgressStatus: MyProgressStatus | null;
  recipesSectionTitle: string | null;
  recipesSectionSubtitle: string | null;
  introSteps: StrapiIntroStepRaw[] | null;
};

// ─── Mapper ───────────────────────────────────────────────────────────────

function mapIntroStep(raw: StrapiIntroStepRaw): ChallengeIntroStep {
  return { title: raw.title, description: raw.description };
}

function mapShirChallengePage(
  raw: StrapiData<StrapiShirChallengePageAttrs>
): ShirChallengePage {
  return {
    title: raw.title ?? null,
    badgeText: raw.badgeText ?? null,
    subtitle: raw.subtitle ?? null,
    heroImage: mapImage(raw.heroImage),
    monthlyIngredientName: raw.monthlyIngredientName ?? null,
    monthlyIngredientDescription: raw.monthlyIngredientDescription ?? null,
    monthLabel: raw.monthLabel ?? null,
    myProgressStatus: raw.myProgressStatus ?? null,
    recipesSectionTitle: raw.recipesSectionTitle ?? null,
    recipesSectionSubtitle: raw.recipesSectionSubtitle ?? null,
    introSteps: (raw.introSteps ?? []).map(mapIntroStep),
  };
}

// ─── Populate string ──────────────────────────────────────────────────────

const POPULATE =
  "populate[heroImage]=true" +
  "&populate[introSteps]=true";

// ─── Public API ───────────────────────────────────────────────────────────

/**
 * Fetches the shir-challenge-page single type from Strapi.
 * Returns null if the document has not been created yet in admin.
 */
export async function getShirChallengePage(): Promise<ShirChallengePage | null> {
  try {
    const raw = await apiClient.get<StrapiSingle<StrapiShirChallengePageAttrs>>(
      `/shir-challenge-page?${POPULATE}`
    );
    return mapShirChallengePage(raw.data);
  } catch (err) {
    // Strapi returns 404 when a single type has no saved document yet.
    const apiErr = err as { status?: number };
    if (apiErr?.status === 404) return null;
    throw err;
  }
}
