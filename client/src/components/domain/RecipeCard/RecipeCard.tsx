"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import NextLink from "next/link";
import { ROUTES } from "@/constants";
import type { RecipeSummary } from "@/types/domain";
import { DIFFICULTY_LABEL } from "@/lib/i18n/labels";
import RecipeMeta from "../RecipeMeta";
import { RecipeCardStyle } from "./styles/RecipeCardStyle";

type Props = {
  recipe: RecipeSummary;
  small?: boolean;
};

export default function RecipeCard({ recipe, small = false }: Props) {
  return (
    <Card sx={RecipeCardStyle.card}>
      <CardActionArea
        component={NextLink}
        href={ROUTES.RECIPE(recipe.slug)}
        sx={RecipeCardStyle.actionArea}
      >
        {/* ── Image zone ──────────────────────────────────────────── */}
        <Box sx={RecipeCardStyle.imageZone}>
          {recipe.image ? (
            <Box
              component="img"
              src={recipe.image.url}
              alt={recipe.image.alt}
              sx={RecipeCardStyle.image}
            />
          ) : (
            <Box sx={RecipeCardStyle.imageFallback}>
              <RestaurantIcon sx={RecipeCardStyle.imageFallbackIcon} />
            </Box>
          )}
        </Box>

        {/* ── Content zone ────────────────────────────────────────── */}
        <CardContent sx={small ? RecipeCardStyle.smallContent : RecipeCardStyle.content}>
          <Typography variant="subtitle1" component="h3" sx={RecipeCardStyle.title}>
            {recipe.title}
          </Typography>

          {small ? (
            <Typography variant="body2" sx={RecipeCardStyle.smallMeta}>
              {[
                recipe.prepTime != null ? `${recipe.prepTime} דק'` : null,
                recipe.difficulty != null ? DIFFICULTY_LABEL[recipe.difficulty] : null,
                ...recipe.categories.map((c) => c.name),
              ]
                .filter(Boolean)
                .join(" • ")}
            </Typography>
          ) : (
            <>
              <RecipeMeta
                prepTime={recipe.prepTime}
                servings={recipe.servings}
                difficulty={recipe.difficulty}
                sx={{ justifyContent: "center" }}
              />

              {recipe.categories.length > 0 && (
                <Box sx={RecipeCardStyle.categoriesRow}>
                  {recipe.categories.map((cat) => (
                    <Chip key={cat.id} label={cat.name} size="small" variant="outlined" />
                  ))}
                </Box>
              )}
            </>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
