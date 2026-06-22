"use client";

import { useParams } from "next/navigation";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import { PageContainer, LoadingState, ErrorState, EmptyState, SectionHeader } from "@/components/shared";
import { RecipeCard } from "@/components/domain";
import { useCategory, useRecipesByCategory } from "@/features/category/hooks";

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: category, isLoading: categoryLoading, isError: categoryError } = useCategory(slug);
  const { data: recipesResult, isLoading: recipesLoading } = useRecipesByCategory(slug);

  if (categoryLoading) {
    return <LoadingState label="טוען קטגוריה..." minHeight={400} />;
  }

  if (categoryError || !category) {
    return <ErrorState title="הקטגוריה לא נמצאה" />;
  }

  const recipes = recipesResult?.items ?? [];

  return (
    <PageContainer>
      {/* ── Header ──────────────────────────────────────────────────── */}
      <Box sx={{ mb: 3, textAlign: "center" }}>
        {category.image ? (
          <Box
            component="img"
            src={category.image.url}
            alt={category.image.alt}
            sx={{ width: "100%", maxHeight: 280, objectFit: "cover", borderRadius: 3, mb: 3 }}
          />
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
        <LoadingState label="טוען מתכונים..." minHeight={200} />
      ) : recipes.length === 0 ? (
        <EmptyState title="אין מתכונים" description="אין מתכונים בקטגוריה זו עדיין." />
      ) : (
        <>
          <SectionHeader title="מתכונים" sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {recipes.map((recipe) => (
              <Grid key={recipe.id} size={{ xs: 6, sm: 4, md: 3 }}>
                <RecipeCard recipe={recipe} />
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </PageContainer>
  );
}
