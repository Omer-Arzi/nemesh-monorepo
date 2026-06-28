"use client";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import NextLink from "next/link";
import { PageContainer, SectionHeader, LoadingState, ErrorState } from "@/components/shared";
import { RecipeCard } from "@/components/domain";
import { useLatestRecipes } from "@/features/home/hooks";
import { ROUTES } from "@/constants";
import { LatestRecipesStyle } from "./LatestRecipes.style";
import { LatestRecipesText } from "./LatestRecipes.consts";

function ShowAllLink() {
  return (
    <Box component={NextLink} href={ROUTES.RESULTS} sx={LatestRecipesStyle.showAllLink}>
      {LatestRecipesText.showAll}
    </Box>
  );
}

export default function LatestRecipes() {
  const { data: recipes = [], isLoading, isError } = useLatestRecipes();

  if (isLoading) return <LoadingState minHeight={200} />;
  if (isError) return <ErrorState description={LatestRecipesText.errorLoad} />;
  if (recipes.length === 0) return null;

  return (
    <Box sx={LatestRecipesStyle.root}>
      <PageContainer>
        <SectionHeader
          title={LatestRecipesText.sectionTitle}
          action={<ShowAllLink />}
          sx={{ mb: 3 }}
        />

        <Grid container spacing={2}>
          {recipes.map((recipe, index) => (
            <Grid key={recipe.id} size={{ xs: 12, sm: 4, md: 3 }}>
              <RecipeCard recipe={recipe} priority={index === 0} />
            </Grid>
          ))}
        </Grid>
      </PageContainer>
    </Box>
  );
}
