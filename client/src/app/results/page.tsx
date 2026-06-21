"use client";

import { useRef, useCallback } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageContainer,
  SectionHeader,
} from "@/components/shared";
import { RecipeCard } from "@/components/domain";
import { useInfiniteRecipes } from "@/features/results/hooks";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

export default function ResultsPage() {
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteRecipes();

  // Sentinel element at the bottom of the list — entering the viewport triggers
  // the next page fetch. Disabled when there are no more pages.
  const sentinelRef = useRef<HTMLDivElement>(null);
  const onSentinelVisible = useCallback(() => {
    if (!isFetchingNextPage) fetchNextPage();
  }, [isFetchingNextPage, fetchNextPage]);
  useIntersectionObserver(sentinelRef, onSentinelVisible, hasNextPage);

  const recipes = data?.pages.flatMap((page) => page.items) ?? [];

  // ── Full-page loading (initial fetch) ───────────────────────────────────
  if (isLoading) {
    return <LoadingState label="טוען מתכונים..." minHeight={400} />;
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (isError) {
    return (
      <ErrorState
        description="לא הצלחנו לטעון את המתכונים. אנא בדוק את החיבור ונסה שוב."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <PageContainer>
      <SectionHeader title="מתכונים" sx={{ mb: 3 }} />

      {recipes.length === 0 ? (
        <EmptyState
          title="לא נמצאו מתכונים"
          description="אין מתכונים פורסמו עדיין."
        />
      ) : (
        <Grid container spacing={2}>
          {recipes.map((recipe) => (
            <Grid key={recipe.id} size={{ xs: 6, sm: 4, md: 3 }}>
              <RecipeCard recipe={recipe} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Sentinel — observed by IntersectionObserver to trigger next page */}
      <Box ref={sentinelRef} sx={{ height: 1, mt: 4 }} />

      {/* Spinner shown while loading subsequent pages */}
      {isFetchingNextPage && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      )}
    </PageContainer>
  );
}
