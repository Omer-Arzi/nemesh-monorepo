import { apiClient } from "../client";

/**
 * matchType distinguishes the four ways an ingredient suggestion can arise —
 * needed so the caller can pick the right search scope without re-deriving
 * it from the displayed label:
 *   - "variant"          exact match on a catalog variant (e.g. "שאלוט") — narrow search.
 *   - "canonical"        exact match on the canonical name itself (e.g. "בצל") — broad search.
 *   - "canonical-parent" the canonical parent shown alongside an exact variant match — broad search.
 *   - "partial"          a prefix/contains/fuzzy match on either the canonical name or a variant — narrow search on the matched text.
 */
export type IngredientMatchType = "variant" | "canonical" | "canonical-parent" | "partial";

export type SearchSuggestion =
  | {
      type: "recipe";
      label: string;
      subtitle: string;
      slug: string;
      score: number;
    }
  | {
      type: "ingredient";
      matchType: IngredientMatchType;
      label: string;
      subtitle: string;
      /** Exact text to filter recipes by for a narrow (variant/partial) search. */
      searchTerm: string;
      /** ingredient_catalog_items documentId — stable identity for the underlying catalog entry. */
      canonicalId: string;
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
