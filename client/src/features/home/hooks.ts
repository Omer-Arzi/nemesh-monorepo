import { useQuery } from "@tanstack/react-query";
import { getLatestRecipes } from "@/lib/api/services/recipeService";
import { queryKeys } from "@/lib/query/keys";

export function useLatestRecipes(limit = 4) {
  return useQuery({
    queryKey: queryKeys.recipes.latest(),
    queryFn: () => getLatestRecipes(limit),
  });
}
