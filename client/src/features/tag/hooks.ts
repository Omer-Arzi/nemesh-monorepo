import { useQuery } from "@tanstack/react-query";
import { getTagBySlug, getTags } from "@/lib/api/services/tagService";
import { getRecipesByTag } from "@/lib/api/services/recipeService";
import { queryKeys } from "@/lib/query/keys";

/** Fetches all tags. */
export function useTags() {
  return useQuery({
    queryKey: queryKeys.tags.list(),
    queryFn: () => getTags(),
  });
}

/** Fetches a single tag by slug. Returns null in data when not found. */
export function useTag(slug: string) {
  return useQuery({
    queryKey: queryKeys.tags.detail(slug),
    queryFn: () => getTagBySlug(slug),
    enabled: Boolean(slug),
  });
}

/** Fetches the first page of published recipes belonging to a tag slug. */
export function useRecipesByTag(slug: string) {
  return useQuery({
    queryKey: queryKeys.recipes.byTag(slug),
    queryFn: () => getRecipesByTag(slug),
    enabled: Boolean(slug),
  });
}
