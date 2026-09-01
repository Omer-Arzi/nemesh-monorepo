import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getRecipes,
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
