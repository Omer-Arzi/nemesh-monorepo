"use client";

import Grid from "@mui/material/Grid";
import { PageContainer, SectionHeader, LoadingState, ErrorState, EmptyState } from "@/components/shared";
import { CategoriesPageText } from "./consts";
import { CollectionCard } from "@/components/domain";
import { useCategories } from "@/features/category/hooks";
import { useTags } from "@/features/tag/hooks";
import { ROUTES } from "@/constants";
import type { Tag } from "@/types/domain";

// Name of the special curated collection that lives as a Tag in Strapi.
// The card links to the tag's real slug — nothing is hard-coded except this display name.
const SHIR_CHALLENGE_NAME = "האתגר של שיר";

function findShirChallenge(tags: Tag[]): Tag | null {
  return tags.find((t) => t.name === SHIR_CHALLENGE_NAME) ?? null;
}

export default function CategoriesPage() {
  const { data: categories = [], isLoading: categoriesLoading, isError: categoriesError } = useCategories();
  const { data: tags = [], isLoading: tagsLoading } = useTags();

  const isLoading = categoriesLoading || tagsLoading;

  if (isLoading) {
    return <LoadingState label={CategoriesPageText.loading} minHeight={400} />;
  }

  if (categoriesError) {
    return <ErrorState description={CategoriesPageText.errorLoad} />;
  }

  const shirChallenge = findShirChallenge(tags);
  const totalCards = categories.length + (shirChallenge ? 1 : 0);

  return (
    <PageContainer>
      <SectionHeader title={CategoriesPageText.sectionTitle} sx={{ mb: 3 }} />

      {totalCards === 0 ? (
        <EmptyState title={CategoriesPageText.emptyTitle} description={CategoriesPageText.emptyDescription} />
      ) : (
        <Grid container columnSpacing={2} rowSpacing={3}>
          {/* ── Special "האתגר של שיר" card first (only if tag exists in Strapi) ── */}
          {shirChallenge && (
            <Grid size={{ xs: 6, sm: 4, md: 3 }}>
              <CollectionCard
                name={shirChallenge.name}
                image={shirChallenge.image}
                href={ROUTES.TAG(shirChallenge.slug)}
                special
              />
            </Grid>
          )}

          {/* ── Category cards ──────────────────────────────────────── */}
          {categories.map((category) => (
            <Grid key={category.id} size={{ xs: 6, sm: 4, md: 3 }}>
              <CollectionCard
                name={category.menuName ?? category.name}
                image={category.image}
                href={ROUTES.CATEGORY(category.slug)}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </PageContainer>
  );
}
