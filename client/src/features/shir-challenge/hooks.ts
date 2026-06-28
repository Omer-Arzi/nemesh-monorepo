import { useQuery } from "@tanstack/react-query";
import { getShirChallengePage } from "@/lib/api/services/shirChallengePageService";
import {
  getCurrentChallengeMonth,
  getPreviousChallengeMonth,
} from "@/lib/api/services/shirChallengeMonthService";
import { queryKeys } from "@/lib/query/keys";
import { getCurrentMonthKey, getCurrentMonthStart } from "./shirChallengeUtils";

/** Static page content (title, hero, subtitle). */
export function useShirChallengePage() {
  return useQuery({
    queryKey: queryKeys.shirChallengePage.detail(),
    queryFn: () => getShirChallengePage(),
  });
}

/**
 * Current month's challenge record, keyed by YYYY-MM.
 * Runs in parallel with usePreviousChallengeMonth — no waterfall.
 */
export function useCurrentChallengeMonth() {
  const monthKey = getCurrentMonthKey();
  return useQuery({
    queryKey: queryKeys.shirChallengeMonth.current(monthKey),
    queryFn: () => getCurrentChallengeMonth(monthKey),
  });
}

/**
 * Most recent challenge month before the current one.
 * Uses client-computed monthStart so it runs in parallel with useCurrentChallengeMonth.
 */
export function usePreviousChallengeMonth() {
  const currentMonthStart = getCurrentMonthStart();
  return useQuery({
    queryKey: queryKeys.shirChallengeMonth.previous(currentMonthStart),
    queryFn: () => getPreviousChallengeMonth(currentMonthStart),
  });
}
