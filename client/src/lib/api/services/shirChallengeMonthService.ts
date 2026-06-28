/**
 * Shir Challenge Month service — fetches monthly challenge records.
 *
 * IMPORTANT: The shir-challenge-month collection requires public read access.
 * In Strapi admin → Settings → Roles → Public → shir-challenge-month:
 * enable find and findOne.
 */
import type { StrapiList, StrapiData } from "@/types/api";
import type { ShirChallengeMonth, MyProgressStatus, MonthlyChallengeStatus } from "@/types/domain";
import { apiClient } from "../client";

// ─── Internal Strapi wire types ────────────────────────────────────────────

type StrapiShirChallengeMonthAttrs = {
  monthKey: string;
  monthStart: string;
  monthlyIngredientName: string | null;
  monthlyChallengeStatus: MonthlyChallengeStatus;
  monthlyChallengeNote: string | null;
  myProgressStatus: MyProgressStatus | null;
};

// ─── Mapper ───────────────────────────────────────────────────────────────

function mapMonth(raw: StrapiData<StrapiShirChallengeMonthAttrs>): ShirChallengeMonth {
  return {
    id: raw.documentId,
    monthKey: raw.monthKey,
    monthStart: raw.monthStart,
    monthlyIngredientName: raw.monthlyIngredientName ?? null,
    monthlyChallengeStatus: raw.monthlyChallengeStatus,
    monthlyChallengeNote: raw.monthlyChallengeNote ?? null,
    myProgressStatus: raw.myProgressStatus ?? null,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────

/**
 * Fetches the challenge month record matching the given YYYY-MM key.
 * Returns null if no record exists yet (server auto-creates one on next startup/cron).
 */
export async function getCurrentChallengeMonth(monthKey: string): Promise<ShirChallengeMonth | null> {
  const qs = `filters[monthKey][$eq]=${encodeURIComponent(monthKey)}&pagination[pageSize]=1`;
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
