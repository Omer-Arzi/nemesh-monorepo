import { useQuery } from "@tanstack/react-query";
import { getShirChallengePage } from "@/lib/api/services/shirChallengePageService";
import { queryKeys } from "@/lib/query/keys";

/** Fetches the admin-controlled shir-challenge-page single type content. */
export function useShirChallengePage() {
  return useQuery({
    queryKey: queryKeys.shirChallengePage.detail(),
    queryFn: () => getShirChallengePage(),
  });
}
