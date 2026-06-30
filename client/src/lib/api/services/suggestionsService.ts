import { apiClient } from "../client";

export type SearchSuggestion =
  | {
      type: "recipe";
      label: string;
      subtitle: "מתכון";
      slug: string;
      score: number;
    }
  | {
      type: "ingredient";
      label: string;
      subtitle: string;
      canonicalName: string;
      slug?: string;
      score: number;
    };

type SuggestionsResponse = { data: SearchSuggestion[] };

export async function getSuggestions(q: string, limit = 10): Promise<SearchSuggestion[]> {
  const params = new URLSearchParams({ q, limit: String(limit) });
  const res = await apiClient.get<SuggestionsResponse>(`/recipes/suggestions?${params}`);
  return res.data;
}
