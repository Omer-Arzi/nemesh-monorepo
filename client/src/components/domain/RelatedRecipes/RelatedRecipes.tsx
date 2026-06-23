"use client";

import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { SectionHeader } from "@/components/shared";
import RecipeCard from "../RecipeCard";
import type { RecipeSummary } from "@/types/domain";
import { RelatedRecipesStyle } from "./RelatedRecipes.style";
import { RelatedRecipesText } from "./RelatedRecipes.consts";

type Props = {
  recipes: RecipeSummary[];
};

export default function RelatedRecipes({ recipes }: Props) {
  if (recipes.length === 0) return null;

  return (
    <Box component="section" sx={RelatedRecipesStyle.root}>
      <SectionHeader title={RelatedRecipesText.sectionTitle} sx={RelatedRecipesStyle.header} />
      <Grid container spacing={2}>
        {recipes.map((recipe) => (
          <Grid key={recipe.id} size={{ xs: 6, sm: 4, md: 3 }}>
            <RecipeCard recipe={recipe} small />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
