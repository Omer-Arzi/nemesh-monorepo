"use client";

import { useEffect, useRef } from "react";
import { RecipePageText } from "./consts";
import { Section, LoadingState, ErrorState } from "@/components/shared";
import {
  RecipeHero,
  RecipeDetailLayout,
  StickyIngredientsSidebar,
  PreparationStepsSection,
  RecipeTipsSection,
  RelatedRecipes,
  CookingModeToolbar,
} from "@/components/domain";
import { useRecipe, useRelatedRecipes } from "@/features/recipe/hooks";
import { useCookingMode } from "@/features/cooking-mode";
import { analytics } from "@/lib/analytics";
import type { Recipe, RecipeSummary } from "@/types/domain";

// ── RecipeContent ────────────────────────────────────────────────────────────
// Extracted so useCookingMode is ALWAYS called with a real recipe.id (never "").
// All cooking-mode state lives here and flows down via explicit props.

type ContentProps = {
  recipe: Recipe;
  relatedRecipes: RecipeSummary[];
};

function RecipeContent({ recipe, relatedRecipes }: ContentProps) {
  const totalIngredients = recipe.ingredientSections.reduce(
    (n, s) => n + s.ingredients.length,
    0,
  );
  const totalSteps = recipe.preparationSections.reduce(
    (n, s) => n + s.steps.length,
    0,
  );

  const cookingMode = useCookingMode(recipe.id, totalIngredients, totalSteps);

  // Track recipe view once on mount.
  useEffect(() => {
    analytics.trackRecipeView({
      recipe_id: recipe.id,
      recipe_name: recipe.title,
      recipe_slug: recipe.slug,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Track cooking mode start/exit. The ref skips the initial false state.
  const cookingModeMountedRef = useRef(false);
  useEffect(() => {
    if (!cookingModeMountedRef.current) {
      cookingModeMountedRef.current = true;
      return;
    }
    if (cookingMode.isActive) {
      analytics.trackCookingModeStart({ recipe_id: recipe.id, recipe_name: recipe.title });
    } else {
      analytics.trackCookingModeExit({ recipe_id: recipe.id, recipe_name: recipe.title });
    }
  }, [cookingMode.isActive]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <RecipeHero
        title={recipe.title}
        image={recipe.image}
        description={recipe.description}
        categories={recipe.categories}
        prepTime={recipe.prepTime}
        servings={recipe.servings}
        difficulty={recipe.difficulty}
      />

      <RecipeTipsSection tips={recipe.tips} />

      <CookingModeToolbar
        isActive={cookingMode.isActive}
        onToggle={cookingMode.toggleActive}
        onReset={cookingMode.reset}
        ingredientProgress={cookingMode.ingredientProgress}
        stepProgress={cookingMode.stepProgress}
      />

      <RecipeDetailLayout
        sidebar={
          <StickyIngredientsSidebar
            ingredientSections={recipe.ingredientSections}
            cookingMode={{
              isActive: cookingMode.isActive,
              checkedKeys: cookingMode.checkedIngredientKeys,
              onToggle: cookingMode.toggleIngredient,
            }}
          />
        }
      >
        <Section sx={{ px: { xs: 2, md: 4 } }}>
          <PreparationStepsSection
            preparationSections={recipe.preparationSections}
            cookingMode={{
              isActive: cookingMode.isActive,
              checkedKeys: cookingMode.checkedStepKeys,
              onToggle: cookingMode.toggleStep,
            }}
          />
        </Section>
      </RecipeDetailLayout>

      <RelatedRecipes recipes={relatedRecipes} />
    </>
  );
}

// ── RecipePageClient ─────────────────────────────────────────────────────────

type Props = {
  slug: string;
};

export default function RecipePageClient({ slug }: Props) {
  const { data: recipe, isLoading, isError, refetch } = useRecipe(slug);
  const { data: relatedRecipes = [] } = useRelatedRecipes(slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading) {
    return <LoadingState label={RecipePageText.loading} minHeight={400} />;
  }

  if (isError) {
    return (
      <ErrorState
        description={RecipePageText.errorLoad}
        onRetry={() => refetch()}
      />
    );
  }

  if (!recipe) {
    return <ErrorState title={RecipePageText.errorNotFound} />;
  }

  return <RecipeContent recipe={recipe} relatedRecipes={relatedRecipes} />;
}
