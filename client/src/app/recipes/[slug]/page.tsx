"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { Section, LoadingState, ErrorState } from "@/components/shared";
import {
  RecipeHero,
  RecipeDetailLayout,
  StickyIngredientsSidebar,
  PreparationStepsSection,
  RecipeTipsSection,
  RelatedRecipes,
} from "@/components/domain";
import { useRecipe, useRelatedRecipes } from "@/features/recipe/hooks";
import { useCookingMode } from "@/features/cooking-mode";
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

      <RecipeDetailLayout
        sidebar={
          <StickyIngredientsSidebar
            ingredientSections={recipe.ingredientSections}
            cookingMode={{
              isActive: cookingMode.isActive,
              checkedKeys: cookingMode.checkedIngredientKeys,
              onToggle: cookingMode.toggleIngredient,
              toggleActive: cookingMode.toggleActive,
              ingredientProgress: cookingMode.ingredientProgress,
              reset: cookingMode.reset,
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
              stepProgress: cookingMode.stepProgress,
              reset: cookingMode.reset,
            }}
          />
        </Section>
      </RecipeDetailLayout>

      <RelatedRecipes recipes={relatedRecipes} />
    </>
  );
}

// ── RecipePage ───────────────────────────────────────────────────────────────

export default function RecipePage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: recipe, isLoading, isError, refetch } = useRecipe(slug);
  const { data: relatedRecipes = [] } = useRelatedRecipes(slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading) {
    return <LoadingState label="טוען מתכון..." minHeight={400} />;
  }

  if (isError) {
    return (
      <ErrorState
        description="לא הצלחנו לטעון את המתכון. אנא בדוק את החיבור ונסה שוב."
        onRetry={() => refetch()}
      />
    );
  }

  if (!recipe) {
    return <ErrorState title="המתכון לא נמצא" />;
  }

  return <RecipeContent recipe={recipe} relatedRecipes={relatedRecipes} />;
}
