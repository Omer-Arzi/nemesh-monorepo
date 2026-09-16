import { useQuery } from "@tanstack/react-query";
import { getCategoryBySlug, getCategories } from "@/lib/api/services/categoryService";
import { getRecipesByCategory } from "@/lib/api/services/recipeService";
import { queryKeys } from "@/lib/query/keys";
import type { Category, RecipeSummary } from "@/types/domain";
import type { PaginatedResult } from "@/types/shared";

/** Fetches all categories. */
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: () => getCategories(),
  });
}

/**
 * Fetches a single category by slug. Returns null in data when not found.
 *
 * `initialData`, when passed, seeds the query with the category already
 * fetched server-side (`categories/[slug]/page.tsx`) so the very first
 * render — including the server-rendered HTML — shows the real category
 * instead of the loading state. The query still refetches in the background
 * per the normal `staleTime` once mounted.
 */
export function useCategory(slug: string, initialData?: Category | null) {
  return useQuery({
    queryKey: queryKeys.categories.detail(slug),
    queryFn: () => getCategoryBySlug(slug),
    enabled: Boolean(slug),
    initialData,
  });
}

/**
 * Fetches the first page of published recipes belonging to a category slug.
 *
 * `initialData` mirrors `useCategory` above — seeds the first page of
 * recipes fetched server-side so they render in the initial HTML.
 */
export function useRecipesByCategory(
  slug: string,
  initialData?: PaginatedResult<RecipeSummary>,
) {
  return useQuery({
    queryKey: queryKeys.recipes.byCategory(slug),
    queryFn: () => getRecipesByCategory(slug),
    enabled: Boolean(slug),
    initialData,
  });
}
