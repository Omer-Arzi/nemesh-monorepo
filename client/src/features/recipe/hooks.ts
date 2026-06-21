import { useQuery } from "@tanstack/react-query";
import { getRecipeBySlug, getRelatedRecipes } from "@/lib/api/services/recipeService";
import { queryKeys } from "@/lib/query/keys";

/**
 * Fetches a single recipe by slug with all fields populated.
 * Returns `null` in `data` when no published recipe with that slug exists.
 */
export function useRecipe(slug: string) {
  return useQuery({
    queryKey: queryKeys.recipes.detail(slug),
    queryFn: () => getRecipeBySlug(slug),
    enabled: Boolean(slug),
  });
}

/**
 * Fetches up to 4 related recipes for the given slug.
 * Scoring and selection are deterministic — same results on every refresh
 * unless underlying recipe/category data changes.
 */
export function useRelatedRecipes(slug: string) {
  return useQuery({
    queryKey: queryKeys.recipes.related(slug),
    queryFn: () => getRelatedRecipes(slug),
    enabled: Boolean(slug),
  });
}
