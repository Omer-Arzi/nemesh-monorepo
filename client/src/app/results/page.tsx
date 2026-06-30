"use client";

import { Suspense, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { ResultsPageText } from "./consts";
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
import { useInfiniteRecipes, useIngredientSearch, useSearch } from "@/features/results/hooks";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { ROUTES } from "@/constants";

// ── Search results (free-text, finite list) ───────────────────────────────────

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
    return <ErrorState description={ResultsPageText.searchError} />;
  }

  return (
    <PageContainer>
      <SectionHeader title={`תוצאות עבור "${q}"`} sx={{ mb: 3 }} />
      {recipes.length === 0 ? (
        <EmptyState
          icon={<MenuBookOutlinedIcon fontSize="inherit" />}
          title={ResultsPageText.searchEmptyTitle}
          description={ResultsPageText.searchEmptyDescription}
          action={
            <Button
              component={NextLink}
              href={ROUTES.CATEGORIES}
              variant="outlined"
              size="small"
            >
              {ResultsPageText.searchEmptyAction}
            </Button>
          }
        />
      ) : (
        <Grid container spacing={2}>
          {recipes.map((recipe, index) => (
            <Grid key={recipe.id} size={{ xs: 12, sm: 4, md: 3 }}>
              <RecipeCard recipe={recipe} priority={index < 3} />
            </Grid>
          ))}
        </Grid>
      )}
    </PageContainer>
  );
}

// ── Ingredient-intent results (exact substring match, no fuzzy) ───────────────

function IngredientResults({ ingredient }: { ingredient: string }) {
  const { data: recipes = [], isLoading, isError } = useIngredientSearch(ingredient);

  if (isLoading) {
    return (
      <PageContainer>
        <SectionHeader title={ResultsPageText.ingredientSectionTitle(ingredient)} sx={{ mb: 3 }} />
        <RecipeGridSkeleton count={8} />
      </PageContainer>
    );
  }

  if (isError) {
    return <ErrorState description={ResultsPageText.ingredientError} />;
  }

  return (
    <PageContainer>
      <SectionHeader title={ResultsPageText.ingredientSectionTitle(ingredient)} sx={{ mb: 3 }} />
      {recipes.length === 0 ? (
        <EmptyState
          icon={<MenuBookOutlinedIcon fontSize="inherit" />}
          title={ResultsPageText.ingredientEmptyTitle}
          description={ResultsPageText.ingredientEmptyDescription}
          action={
            <Button
              component={NextLink}
              href={ROUTES.CATEGORIES}
              variant="outlined"
              size="small"
            >
              {ResultsPageText.searchEmptyAction}
            </Button>
          }
        />
      ) : (
        <Grid container spacing={2}>
          {recipes.map((recipe, index) => (
            <Grid key={recipe.id} size={{ xs: 12, sm: 4, md: 3 }}>
              <RecipeCard recipe={recipe} priority={index < 3} />
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
        <SectionHeader title={ResultsPageText.sectionTitle} sx={{ mb: 3 }} />
        <RecipeGridSkeleton count={8} />
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <ErrorState
        description={ResultsPageText.browseError}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <PageContainer>
      <SectionHeader title={ResultsPageText.sectionTitle} sx={{ mb: 3 }} />

      {recipes.length === 0 ? (
        <EmptyState
          icon={<MenuBookOutlinedIcon fontSize="inherit" />}
          title={ResultsPageText.browseEmptyTitle}
          description={ResultsPageText.browseEmptyDescription}
        />
      ) : (
        <Grid container spacing={2}>
          {recipes.map((recipe, index) => (
            <Grid key={recipe.id} size={{ xs: 12, sm: 4, md: 3 }}>
              <RecipeCard recipe={recipe} priority={index < 3} />
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

// ── Router-aware shell ────────────────────────────────────────────────────────

function ResultsContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.trim() ?? "";
  const ingredient = searchParams.get("ingredient")?.trim() ?? "";

  if (ingredient) return <IngredientResults ingredient={ingredient} />;
  if (q) return <SearchResults q={q} />;
  return <BrowseResults />;
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
