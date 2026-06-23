"use client";

import { Suspense, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import NextLink from "next/link";
import {
  EmptyState,
  ErrorState,
  PageContainer,
  SectionHeader,
} from "@/components/shared";
import { RecipeCard, RecipeGridSkeleton } from "@/components/domain";
import { useInfiniteRecipes, useSearch } from "@/features/results/hooks";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { ROUTES } from "@/constants";

// ── Search results (finite list) ──────────────────────────────────────────────

function SearchResults({ q }: { q: string }) {
  const { data: recipes = [], isLoading, isError } = useSearch(q);

  if (isLoading) {
    return (
      <PageContainer>
        <SectionHeader title={`תוצאות עבור "${q}"`} sx={{ mb: 3 }} />
        <RecipeGridSkeleton count={8} />
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <ErrorState description="החיפוש נכשל. אנא בדוק את החיבור ונסה שוב." />
    );
  }

  return (
    <PageContainer>
      <SectionHeader title={`תוצאות עבור "${q}"`} sx={{ mb: 3 }} />
      {recipes.length === 0 ? (
        <EmptyState
          icon={<MenuBookOutlinedIcon fontSize="inherit" />}
          title="לא מצאנו מתכונים שמתאימים לחיפוש הזה"
          description="אפשר לנסות פחות מרכיבים, מילה אחרת, או להציץ בקטגוריות."
          action={
            <Button
              component={NextLink}
              href={ROUTES.CATEGORIES}
              variant="outlined"
              size="small"
            >
              לקטגוריות
            </Button>
          }
        />
      ) : (
        <Grid container spacing={2}>
          {recipes.map((recipe) => (
            <Grid key={recipe.id} size={{ xs: 12, sm: 4, md: 3 }}>
              <RecipeCard recipe={recipe} />
            </Grid>
          ))}
        </Grid>
      )}
    </PageContainer>
  );
}

// ── Browse all (infinite scroll) ──────────────────────────────────────────────

function BrowseResults() {
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteRecipes();

  const sentinelRef = useRef<HTMLDivElement>(null);
  const onSentinelVisible = useCallback(() => {
    if (!isFetchingNextPage) fetchNextPage();
  }, [isFetchingNextPage, fetchNextPage]);
  useIntersectionObserver(sentinelRef, onSentinelVisible, hasNextPage);

  const recipes = data?.pages.flatMap((page) => page.items) ?? [];

  if (isLoading) {
    return (
      <PageContainer>
        <SectionHeader title="מתכונים" sx={{ mb: 3 }} />
        <RecipeGridSkeleton count={8} />
      </PageContainer>
    );
  }

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
          icon={<MenuBookOutlinedIcon fontSize="inherit" />}
          title="עוד לא פרסמנו מתכונים"
          description="חוזרים בקרוב עם דברים טובים מהמטבח."
        />
      ) : (
        <Grid container spacing={2}>
          {recipes.map((recipe) => (
            <Grid key={recipe.id} size={{ xs: 12, sm: 4, md: 3 }}>
              <RecipeCard recipe={recipe} />
            </Grid>
          ))}
        </Grid>
      )}

      <Box ref={sentinelRef} sx={{ height: 1, mt: 4 }} />

      {isFetchingNextPage && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      )}
    </PageContainer>
  );
}

// ── Router-aware shell — reads ?q from URL ─────────────────────────────────

function ResultsContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.trim() ?? "";

  return q ? <SearchResults q={q} /> : <BrowseResults />;
}

// ── Page export — Suspense required for useSearchParams ───────────────────────

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <RecipeGridSkeleton count={8} />
        </PageContainer>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
