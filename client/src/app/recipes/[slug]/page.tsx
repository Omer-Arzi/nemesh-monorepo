"use client";

import { useParams } from "next/navigation";
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

      <RecipeDetailLayout
        sidebar={
          <StickyIngredientsSidebar
            ingredients={recipe.ingredients}
            servings={recipe.servings}
          />
        }
      >
        <Section sx={{ px: { xs: 2, md: 4 } }}>
          <PreparationStepsSection steps={recipe.steps} />
          <RecipeTipsSection tips={recipe.tips} sx={{ mt: 4 }} />
        </Section>
      </RecipeDetailLayout>

      <RelatedRecipes recipes={relatedRecipes} />
    </>
  );
}
