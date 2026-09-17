/**
 * Shir Challenge Month service — fetches monthly challenge records.
 *
 * IMPORTANT: The shir-challenge-month collection requires public read access.
 * In Strapi admin → Settings → Roles → Public → shir-challenge-month:
 * enable find and findOne.
 */
import type { StrapiList, StrapiData } from "@/types/api";
import type {
  ShirChallengeMonth,
  ShirChallengeMonthRecipeRef,
  MyProgressStatus,
  MonthlyChallengeStatus,
} from "@/types/domain";
import { apiClient } from "../client";
import { mapImage, type StrapiMediaRaw } from "../mappers";

// ─── Internal Strapi wire types ────────────────────────────────────────────

// Minimal projection of the linked recipe — only what the homepage carousel
// card renders (title/slug/prepTime/image). publishedAt is wire-only, used
// to drop links to draft recipes; it never reaches the domain type.
type StrapiShirChallengeMonthRecipeRaw = {
  title: string;
  slug: string;
  prepTime: number | null;
  publishedAt: string | null;
  image: StrapiMediaRaw | null;
};

type StrapiShirChallengeMonthAttrs = {
  monthKey: string;
  monthStart: string;
  monthlyIngredientName: string | null;
  monthlyChallengeStatus: MonthlyChallengeStatus;
  monthlyChallengeNote: string | null;
  myProgressStatus: MyProgressStatus | null;
  // Absent (not populated) on getCurrentChallengeMonth/getPreviousChallengeMonth's
  // queries — only getShirChallengeCarouselMonths requests it.
  recipe?: StrapiShirChallengeMonthRecipeRaw | null;
};

// ─── Mapper ───────────────────────────────────────────────────────────────

// Never surfaces a relation pointing at an unpublished/draft recipe — mirrors
// recipeService.ts's mapPreparationRecipe guard. The carousel is public
// homepage content, and a draft recipe's own page 404s for anonymous visitors.
function mapMonthRecipe(
  raw: StrapiShirChallengeMonthRecipeRaw | null | undefined
): ShirChallengeMonthRecipeRef | null {
  if (!raw) return null;
  if (!raw.publishedAt) return null;
  return {
    title: raw.title,
    slug: raw.slug,
    prepTime: raw.prepTime ?? null,
    image: mapImage(raw.image ?? null),
  };
}

function mapMonth(raw: StrapiData<StrapiShirChallengeMonthAttrs>): ShirChallengeMonth {
  return {
    id: raw.documentId,
    monthKey: raw.monthKey,
    monthStart: raw.monthStart,
    monthlyIngredientName: raw.monthlyIngredientName ?? null,
    monthlyChallengeStatus: raw.monthlyChallengeStatus,
    monthlyChallengeNote: raw.monthlyChallengeNote ?? null,
    myProgressStatus: raw.myProgressStatus ?? null,
    recipe: mapMonthRecipe(raw.recipe),
  };
}

// ─── Public API ───────────────────────────────────────────────────────────

/**
 * Fetches the challenge month record matching the given YYYY-MM key.
 * Returns null if no record exists yet (server auto-creates one on next startup/cron).
 *
 * `monthKey` is no longer unique (a calendar month can hold more than one
 * challenge instance — see shir-challenge-month's schema.json) so an explicit
 * tie-break sort is required for `pagination[pageSize]=1` to be deterministic:
 * the chronologically-first instance in the month wins. With today's real
 * data (at most one record per month), this sort is a no-op.
 */
export async function getCurrentChallengeMonth(monthKey: string): Promise<ShirChallengeMonth | null> {
  const qs =
    `filters[monthKey][$eq]=${encodeURIComponent(monthKey)}` +
    `&sort[0]=monthStart:asc` +
    `&pagination[pageSize]=1`;
  const raw = await apiClient.get<StrapiList<StrapiShirChallengeMonthAttrs>>(
    `/shir-challenge-months?${qs}`
  );
  const first = raw.data[0];
  return first ? mapMonth(first) : null;
}

/**
 * Fetches the most recent challenge month record that started before
 * `beforeMonthStart` (ISO date string "YYYY-MM-DD").
 * Returns null if no earlier record exists.
 */
export async function getPreviousChallengeMonth(
  beforeMonthStart: string
): Promise<ShirChallengeMonth | null> {
  const qs =
    `filters[monthStart][$lt]=${encodeURIComponent(beforeMonthStart)}` +
    `&sort[0]=monthStart:desc` +
    `&pagination[pageSize]=1`;
  const raw = await apiClient.get<StrapiList<StrapiShirChallengeMonthAttrs>>(
    `/shir-challenge-months?${qs}`
  );
  const first = raw.data[0];
  return first ? mapMonth(first) : null;
}

const CAROUSEL_POPULATE =
  "populate[recipe][fields][0]=title" +
  "&populate[recipe][fields][1]=slug" +
  "&populate[recipe][fields][2]=prepTime" +
  "&populate[recipe][fields][3]=publishedAt" +
  "&populate[recipe][populate][image]=true";

/**
 * Fetches the months to show in the homepage carousel: any month with a
 * matched (published) recipe, plus `currentMonthKey` itself as a placeholder
 * when unmatched — older unmatched back-support months are excluded. Sorted
 * newest-first by monthKey (calendar order), matching the RTL carousel's
 * read order with no client-side reversal needed.
 *
 * The inclusion rule is applied client-side rather than via a server-side
 * `$or`/`$notNull` relation filter: this collection is small and structurally
 * bounded (~12 records/year — see shir-challenge-month's own schema
 * description), so fetching the full list is cheap, and it avoids relying on
 * an unverified combination of Strapi filter operators (verifying the
 * positive-match case would require writing a real relation onto a live
 * content record, which is out of bounds for routine implementation
 * verification).
 *
 * `monthKey` is no longer unique (a calendar month can hold more than one
 * challenge instance), so a secondary `monthStart:desc` sort is added purely
 * for determinism between two records that tie on `monthKey` — otherwise
 * their relative order would be unspecified across requests. With today's
 * data (no ties possible), this is a no-op.
 */
export async function getShirChallengeCarouselMonths(currentMonthKey: string): Promise<ShirChallengeMonth[]> {
  const qs = `${CAROUSEL_POPULATE}&sort[0]=monthKey:desc&sort[1]=monthStart:desc&pagination[pageSize]=100`;
  const raw = await apiClient.get<StrapiList<StrapiShirChallengeMonthAttrs>>(
    `/shir-challenge-months?${qs}`
  );
  return raw.data
    .map(mapMonth)
    .filter((month) => month.recipe !== null || month.monthKey === currentMonthKey);
}
