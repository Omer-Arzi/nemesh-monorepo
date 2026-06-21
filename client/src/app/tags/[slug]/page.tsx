"use client";

import { useParams } from "next/navigation";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { PageContainer, LoadingState, ErrorState, EmptyState, SectionHeader } from "@/components/shared";
import { RecipeCard } from "@/components/domain";
import { useTag, useRecipesByTag } from "@/features/tag/hooks";

export default function TagPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: tag, isLoading: tagLoading, isError: tagError } = useTag(slug);
  const { data: recipesResult, isLoading: recipesLoading } = useRecipesByTag(slug);

  if (tagLoading) {
    return <LoadingState label="טוען תגית..." minHeight={400} />;
  }

  if (tagError || !tag) {
    return <ErrorState title="התגית לא נמצאה" />;
  }

  const recipes = recipesResult?.items ?? [];

  return (
    <PageContainer>
      {/* ── Header ──────────────────────────────────────────────────── */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        {tag.image ? (
          <Box
            component="img"
            src={tag.image.url}
            alt={tag.image.alt}
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
            <LocalOfferIcon sx={{ fontSize: 64, color: "text.disabled", opacity: 0.4 }} />
          </Box>
        )}

        <Typography variant="h4" component="h1" fontWeight={700}>
          {tag.name}
        </Typography>

        {tag.description && (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: 600, mx: "auto" }}>
            {tag.description}
          </Typography>
        )}
      </Box>

      {/* ── Recipe grid ─────────────────────────────────────────────── */}
      {recipesLoading ? (
        <LoadingState label="טוען מתכונים..." minHeight={200} />
      ) : recipes.length === 0 ? (
        <EmptyState description="אין מתכונים עם תגית זו עדיין." />
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
