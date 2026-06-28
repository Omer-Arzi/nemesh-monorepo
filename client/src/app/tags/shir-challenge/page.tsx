"use client";

import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { PageContainer, SectionHeader, LoadingState, ErrorState, EmptyState } from "@/components/shared";
import { RecipeCard } from "@/components/domain";
import { useTag, useRecipesByTag } from "@/features/tag/hooks";
import { useShirChallengePage } from "@/features/shir-challenge/hooks";
import { ShirChallengeHero } from "@/features/shir-challenge/ShirChallengeHero";
import { ShirChallengeIngredientCard } from "@/features/shir-challenge/ShirChallengeIngredientCard";
import { ShirChallengeIntroSteps } from "@/features/shir-challenge/ShirChallengeIntroSteps";
import {
  SHIR_CHALLENGE_SLUG,
  ShirChallengeDefaults,
  ShirChallengeText,
} from "@/features/shir-challenge/ShirChallenge.consts";

export default function ShirChallengePage() {
  const { data: content, isLoading: contentLoading } = useShirChallengePage();
  const { data: tag, isLoading: tagLoading, isError: tagError } = useTag(SHIR_CHALLENGE_SLUG);
  const { data: recipesResult, isLoading: recipesLoading } = useRecipesByTag(SHIR_CHALLENGE_SLUG);

  if (contentLoading || tagLoading) {
    return <LoadingState label={ShirChallengeText.loading} minHeight={400} />;
  }

  if (tagError || !tag) {
    return <ErrorState title={ShirChallengeText.errorNotFound} />;
  }

  const title = content?.title ?? ShirChallengeDefaults.title;
  const badgeText = content?.badgeText ?? ShirChallengeDefaults.badgeText;
  const subtitle = content?.subtitle ?? ShirChallengeDefaults.subtitle;
  const heroImage = content?.heroImage ?? tag.image ?? null;
  const introSteps = content?.introSteps ?? [];
  const recipesSectionTitle = content?.recipesSectionTitle ?? ShirChallengeDefaults.recipesSectionTitle;
  const recipesSectionSubtitle = content?.recipesSectionSubtitle ?? ShirChallengeDefaults.recipesSectionSubtitle;

  const recipes = recipesResult?.items ?? [];

  return (
    <>
      <PageContainer sx={{ pb: 0 }}>
        <ShirChallengeHero
          title={title}
          badgeText={badgeText}
          subtitle={subtitle}
          heroImage={heroImage}
        />

        {content?.monthlyIngredientName && (
          <ShirChallengeIngredientCard
            monthlyIngredientName={content.monthlyIngredientName}
            monthlyIngredientDescription={content.monthlyIngredientDescription}
            monthLabel={content.monthLabel}
            myProgressStatus={content.myProgressStatus}
          />
        )}

        {introSteps.length > 0 && <ShirChallengeIntroSteps steps={introSteps} />}
      </PageContainer>

      <PageContainer>
        <SectionHeader
          title={recipesSectionTitle}
          subtitle={recipesSectionSubtitle ?? undefined}
          sx={{ mb: 2.5 }}
        />

        {recipesLoading ? (
          <LoadingState label={ShirChallengeText.recipesLoading} minHeight={200} />
        ) : recipes.length === 0 ? (
          <EmptyState
            title={ShirChallengeText.emptyTitle}
            description={ShirChallengeText.emptyDescription}
          />
        ) : (
          <Box sx={{ pb: { xs: 4, sm: 5, md: 6 } }}>
            <Grid container spacing={2}>
              {recipes.map((recipe) => (
                <Grid key={recipe.id} size={{ xs: 6, sm: 4, md: 3 }}>
                  <RecipeCard recipe={recipe} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </PageContainer>
    </>
  );
}
