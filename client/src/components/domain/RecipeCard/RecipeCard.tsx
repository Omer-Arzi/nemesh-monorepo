"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import { ROUTES } from "@/constants";
import type { RecipeSummary } from "@/types/domain";
import { DIFFICULTY_LABEL } from "@/lib/i18n/labels";
import { formatPrepTime } from "@/lib/formatters/prepTime";
import { NemeshImage } from "@/components/shared";
import RecipeMeta from "../RecipeMeta";
import { RecipeCardStyle } from "./styles/RecipeCardStyle";

type Props = {
  recipe: RecipeSummary;
  small?: boolean;
  /** Mark the card image as high-priority (eager load + preload). Use for the first card in a list that is likely the LCP. */
  priority?: boolean;
};

const MAX_VISIBLE_CATEGORIES = 3;
const MAX_VISIBLE_TAGS = 3;

export default function RecipeCard({ recipe, small = false, priority = false }: Props) {
  const visibleCategories = recipe.categories.slice(0, MAX_VISIBLE_CATEGORIES);
  const hiddenCount = recipe.categories.length - visibleCategories.length;

  const visibleTags = recipe.tags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenTagCount = recipe.tags.length - visibleTags.length;

  return (
    <Card sx={RecipeCardStyle.card}>
      <CardActionArea
        component={NextLink}
        href={ROUTES.RECIPE(recipe.slug)}
        sx={RecipeCardStyle.actionArea}
      >
        {/* ── Image zone ──────────────────────────────────────────── */}
        <Box sx={RecipeCardStyle.imageZone}>
          <NemeshImage
            image={recipe.image}
            fill
            priority={priority}
            sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
            objectFit="cover"
          />
        </Box>

        {/* ── Content zone ────────────────────────────────────────── */}
        <CardContent sx={small ? RecipeCardStyle.smallContent : RecipeCardStyle.content}>
          <Typography variant="subtitle1" component="h3" sx={RecipeCardStyle.title}>
            {recipe.title}
          </Typography>

          {small ? (
            <Typography variant="body2" sx={RecipeCardStyle.smallMeta}>
              {[
                recipe.prepTime != null ? formatPrepTime(recipe.prepTime) : null,
                recipe.difficulty != null ? DIFFICULTY_LABEL[recipe.difficulty] : null,
                ...recipe.categories.map((c) => c.name),
                ...recipe.tags.map((t) => t.name),
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

              {visibleCategories.length > 0 && (
                <Box sx={RecipeCardStyle.categoriesRow}>
                  {visibleCategories.map((cat) => (
                    <Chip key={cat.id} label={cat.name} size="small" variant="outlined" />
                  ))}
                  {hiddenCount > 0 && (
                    <Chip
                      label={`+${hiddenCount}`}
                      size="small"
                      variant="outlined"
                      sx={RecipeCardStyle.overflowChip}
                    />
                  )}
                </Box>
              )}

              {visibleTags.length > 0 && (
                <Box sx={RecipeCardStyle.tagsRow}>
                  {visibleTags.map((tag) => (
                    <Chip key={tag.id} label={tag.name} size="small" sx={RecipeCardStyle.tagChip} />
                  ))}
                  {hiddenTagCount > 0 && (
                    <Chip
                      label={`+${hiddenTagCount}`}
                      size="small"
                      sx={{ ...RecipeCardStyle.tagChip, ...RecipeCardStyle.overflowChip }}
                    />
                  )}
                </Box>
              )}
            </>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
