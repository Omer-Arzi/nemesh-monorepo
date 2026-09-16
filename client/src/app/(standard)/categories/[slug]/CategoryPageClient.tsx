"use client";

import { useEffect } from "react";
import Box from "@mui/material/Box";
import { CategoryPageText } from "./consts";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import { PageContainer, LoadingState, ErrorState, EmptyState, SectionHeader, NemeshImage } from "@/components/shared";
import { RecipeCard, RecipeGridSkeleton } from "@/components/domain";
import { useCategory, useRecipesByCategory } from "@/features/category/hooks";
import { analytics } from "@/lib/analytics";
import type { Category, RecipeSummary } from "@/types/domain";
import type { PaginatedResult } from "@/types/shared";

type Props = {
  slug: string;
  /** Fetched server-side in page.tsx; seeds `useCategory` so the very first
   *  render (including the server-rendered HTML) shows the real category. */
  initialCategory: Category;
  /** Same idea, for the first page of recipes. `null` when the server-side
   *  fetch failed (a transient Strapi hiccup) — the query below then falls
   *  back to its normal client-side fetch + loading state. */
  initialRecipes: PaginatedResult<RecipeSummary> | null;
};

export default function CategoryPageClient({ slug, initialCategory, initialRecipes }: Props) {
  const { data: category, isLoading: categoryLoading, isError: categoryError } = useCategory(
    slug,
    initialCategory,
  );
  const { data: recipesResult, isLoading: recipesLoading } = useRecipesByCategory(
    slug,
    initialRecipes ?? undefined,
  );

  useEffect(() => {
    if (!category) return;
    analytics.trackCategoryView({
      category_id: category.id,
      category_name: category.name,
      category_slug: slug,
    });
  }, [category?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (categoryLoading) {
    return <LoadingState label={CategoryPageText.loading} minHeight={400} />;
  }

  if (categoryError || !category) {
    return <ErrorState title={CategoryPageText.errorNotFound} />;
  }

  const recipes = recipesResult?.items ?? [];

  return (
    <PageContainer>
      {/* ── Category header ──────────────────────────────────────────── */}
      <Box sx={{ mb: 3, textAlign: "center" }}>
        {category.image ? (
          <Box sx={{ position: "relative", height: 280, borderRadius: 3, mb: 3, overflow: "hidden" }}>
            <NemeshImage
              image={category.image}
              fill
              objectFit="cover"
              objectPosition="center 60%"
              sizes="(max-width: 600px) 100vw, 800px"
            />
          </Box>
        ) : (
          <Box
            sx={{
              width: "100%",
              height: 160,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "action.hover",
              borderRadius: 3,
              mb: 3,
            }}
          >
            <RestaurantIcon sx={{ fontSize: 64, color: "text.disabled", opacity: 0.4 }} />
          </Box>
        )}

        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          {category.menuName ?? category.name}
        </Typography>

        {category.description && (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: 600, mx: "auto" }}>
            {category.description}
          </Typography>
        )}
      </Box>

      {/* ── Recipe grid ─────────────────────────────────────────────── */}
      {recipesLoading ? (
        <RecipeGridSkeleton count={4} />
      ) : recipes.length === 0 ? (
        <EmptyState
          icon={<MenuBookOutlinedIcon fontSize="inherit" />}
          title={CategoryPageText.emptyTitle}
          description={CategoryPageText.emptyDescription}
        />
      ) : (
        <>
          <SectionHeader title={CategoryPageText.recipeSectionTitle} sx={{ mb: 2 }} />
          {/* xs:12 = single column on mobile, consistent with the results page grid */}
          <Grid container spacing={2}>
            {recipes.map((recipe) => (
              <Grid key={recipe.id} size={{ xs: 12, sm: 4, md: 3 }}>
                <RecipeCard recipe={recipe} />
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </PageContainer>
  );
}
