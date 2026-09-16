import { useQuery } from "@tanstack/react-query";
import { getRecipeBySlug, getRelatedRecipes } from "@/lib/api/services/recipeService";
import { queryKeys } from "@/lib/query/keys";
import type { Recipe, RecipeSummary } from "@/types/domain";

/**
 * Fetches a single recipe by slug with all fields populated.
 * Returns `null` in `data` when no published recipe with that slug exists.
 *
 * `initialData`, when passed, seeds the query with the recipe already
 * fetched server-side (`recipes/[slug]/page.tsx`) so the very first render —
 * including the server-rendered HTML — shows the real recipe instead of the
 * loading state. The query still refetches in the background per the normal
 * `staleTime` once mounted.
 */
export function useRecipe(slug: string, initialData?: Recipe | null) {
  return useQuery({
    queryKey: queryKeys.recipes.detail(slug),
    queryFn: () => getRecipeBySlug(slug),
    enabled: Boolean(slug),
    initialData,
  });
}

/**
 * Fetches up to 4 related recipes for the given slug.
 * Scoring and selection are deterministic — same results on every refresh
 * unless underlying recipe/category data changes.
 *
 * `initialData` mirrors `useRecipe` above — seeds the related recipes
 * fetched server-side so they render in the initial HTML.
 */
export function useRelatedRecipes(slug: string, initialData?: RecipeSummary[]) {
  return useQuery({
    queryKey: queryKeys.recipes.related(slug),
    queryFn: () => getRelatedRecipes(slug),
    enabled: Boolean(slug),
    initialData,
  });
}
