"use client";

import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { PageContainer, SectionHeader, LoadingState, ErrorState, EmptyState } from "@/components/shared";
import { RecipeCard } from "@/components/domain";
import { useTag, useRecipesByTag } from "@/features/tag/hooks";
import {
  useShirChallengePage,
  useCurrentChallengeMonth,
  usePreviousChallengeMonth,
} from "@/features/shir-challenge/hooks";
import { ShirChallengeHero } from "@/features/shir-challenge/ShirChallengeHero";
import { ShirChallengeStatusPanel } from "@/features/shir-challenge/ShirChallengeStatusPanel";
import {
  SHIR_CHALLENGE_SLUG,
  ShirChallengeDefaults,
  ShirChallengeText,
} from "@/features/shir-challenge/ShirChallenge.consts";

export default function ShirChallengePage() {
  const { data: content, isLoading: contentLoading } = useShirChallengePage();
  const { data: tag, isLoading: tagLoading, isError: tagError } = useTag(SHIR_CHALLENGE_SLUG);
  const { data: recipesResult, isLoading: recipesLoading } = useRecipesByTag(SHIR_CHALLENGE_SLUG);

  // Both month queries run in parallel (month keys are computed client-side, no waterfall).
  const { data: currentMonth } = useCurrentChallengeMonth();
  const { data: previousMonth } = usePreviousChallengeMonth();

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

        <ShirChallengeStatusPanel
          currentMonth={currentMonth ?? null}
          previousMonth={previousMonth ?? null}
        />
      </PageContainer>

      <PageContainer>
        <SectionHeader title={ShirChallengeDefaults.recipesSectionTitle} sx={{ mb: 2.5 }} />

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
                <Grid key={recipe.id} size={{ xs: 12, sm: 4, md: 3 }}>
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
