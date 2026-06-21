import { useState } from "react";
import { useRouter } from "next/navigation";
import { getRandomRecipe } from "@/lib/api/services/recipeService";
import { ROUTES } from "@/constants";

export function useSurpriseMe() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSurpriseMe() {
    if (loading) return;
    setLoading(true);
    try {
      const recipe = await getRandomRecipe();
      if (recipe) {
        router.push(ROUTES.RECIPE(recipe.slug));
      }
    } catch {
      // Fail silently — user stays on the current page
    } finally {
      setLoading(false);
    }
  }

  return { handleSurpriseMe, loading };
}
