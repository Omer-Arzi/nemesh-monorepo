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
          />
        }
      >
        <Section sx={{ px: { xs: 2, md: 4 } }}>
          <PreparationStepsSection
            preparationSections={recipe.preparationSections}
          />
        </Section>
      </RecipeDetailLayout>

      <RelatedRecipes recipes={relatedRecipes} />
    </>
  );
}
