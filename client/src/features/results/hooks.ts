import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getRecipes,
  getRecipesByTag,
  searchRecipes,
  searchRecipesByIngredient,
  searchRecipesByCanonicalIngredient,
} from "@/lib/api/services/recipeService";
import { queryKeys } from "@/lib/query/keys";
import { PAGINATION } from "@/constants";

const PAGE_SIZE = PAGINATION.DEFAULT_PAGE_SIZE; // 20

/**
 * Fetches search results for a trimmed, non-empty query string.
 * Disabled automatically when `q` is empty.
 */
export function useSearch(q: string) {
  return useQuery({
    queryKey: queryKeys.recipes.search(q),
    queryFn: () => searchRecipes(q),
    enabled: q.trim().length > 0,
  });
}

/**
 * Ingredient-intent search: recipes that actually contain this ingredient.
 * Uses ILIKE substring matching — no fuzzy false positives.
 * Triggered when the user clicks an ingredient suggestion.
 */
export function useIngredientSearch(ingredient: string) {
  return useQuery({
    queryKey: queryKeys.recipes.byIngredient(ingredient),
    queryFn: () => searchRecipesByIngredient(ingredient),
    enabled: ingredient.trim().length > 0,
  });
}

/**
 * Canonical-ingredient search: recipes containing the canonical ingredient or
 * any of its approved catalog variants. Broader than {@link useIngredientSearch}.
 * Triggered when the user selects the canonical (or canonical-parent) suggestion.
 */
export function useCanonicalIngredientSearch(canonicalIngredient: string) {
  return useQuery({
    queryKey: queryKeys.recipes.byCanonicalIngredient(canonicalIngredient),
    queryFn: () => searchRecipesByCanonicalIngredient(canonicalIngredient),
    enabled: canonicalIngredient.trim().length > 0,
  });
}

/**
 * Tag-filter results: published recipes carrying a given tag slug, as one
 * finite list (no infinite scroll) — the link-only `/results?tag=<slug>` mode.
 *
 * One page at `PAGINATION.MAX_PAGE_SIZE` (100). The `/recipes` REST endpoint is
 * hard-capped at 100 by `server/config/api.ts` (`rest.maxLimit`); a curated tag
 * with more than 100 published recipes is implausible, and items past 100 would
 * be silently omitted — the same practical ceiling the search / ingredient
 * modes work within.
 *
 * `select` unwraps the paginated envelope to `RecipeSummary[]` so this hook
 * mirrors `useIngredientSearch` at the call site. An empty list means the tag
 * is not a valid destination (unknown slug, unpublished / all-draft tag, or
 * zero published recipes) — the caller redirects home.
 *
 * Uses its own `byTagResults` key rather than `byTag` so it never shares a
 * cache entry with the challenge page's `useRecipesByTag` (which fetches the
 * same slug at a smaller page size).
 */
export function useTagSearch(slug: string) {
  return useQuery({
    queryKey: queryKeys.recipes.byTagResults(slug),
    queryFn: () => getRecipesByTag(slug, { pageSize: PAGINATION.MAX_PAGE_SIZE }),
    select: (result) => result.items,
    enabled: slug.trim().length > 0,
  });
}

/**
 * Fetches all published recipes with infinite scroll support.
 *
 * Pages are accumulated in `data.pages`; flatten with `.flatMap(p => p.items)`.
 * `hasNextPage` is false once all pages are loaded (derived from Strapi's
 * `pageCount` field in the pagination meta).
 */
export function useInfiniteRecipes() {
  return useInfiniteQuery({
    queryKey: queryKeys.recipes.infinite(),
    queryFn: ({ pageParam }) =>
      getRecipes({ page: pageParam as number, pageSize: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, pageCount } = lastPage.pagination;
      return page < pageCount ? page + 1 : undefined;
    },
  });
}
