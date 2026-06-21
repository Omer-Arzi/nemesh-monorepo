import { useQuery } from "@tanstack/react-query";
import { getCategoryBySlug, getCategories } from "@/lib/api/services/categoryService";
import { getRecipesByCategory } from "@/lib/api/services/recipeService";
import { queryKeys } from "@/lib/query/keys";

/** Fetches all categories. */
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: () => getCategories(),
  });
}

/** Fetches a single category by slug. Returns null in data when not found. */
export function useCategory(slug: string) {
  return useQuery({
    queryKey: queryKeys.categories.detail(slug),
    queryFn: () => getCategoryBySlug(slug),
    enabled: Boolean(slug),
  });
}

/** Fetches the first page of published recipes belonging to a category slug. */
export function useRecipesByCategory(slug: string) {
  return useQuery({
    queryKey: queryKeys.recipes.byCategory(slug),
    queryFn: () => getRecipesByCategory(slug),
    enabled: Boolean(slug),
  });
}
