"use client";

import Box from "@mui/material/Box";
import { PageContainer, SectionHeader, LoadingState, ErrorState } from "@/components/shared";
import { useCategories } from "@/features/category/hooks";
import FeaturedCategoryCard from "../FeaturedCategoryCard";
import { FeaturedCategoriesCarouselStyle } from "./FeaturedCategoriesCarousel.style";

const MAX_CATEGORIES = 10;

export default function FeaturedCategoriesCarousel() {
  const { data: categories = [], isLoading, isError } = useCategories();

  if (isLoading) return <LoadingState minHeight={320} />;
  if (isError) return <ErrorState description="לא הצלחנו לטעון קטגוריות." />;
  if (categories.length === 0) return null;

  const featured = categories.slice(0, MAX_CATEGORIES);

  return (
    <Box sx={FeaturedCategoriesCarouselStyle.root}>
      <PageContainer sx={{ py: 0, pb: 3 }}>
        <SectionHeader title="קטגוריות מובילות" />
      </PageContainer>

      <Box sx={FeaturedCategoriesCarouselStyle.track}>
        <Box aria-hidden sx={FeaturedCategoriesCarouselStyle.trackSpacer} />
        {featured.map((category) => (
          <FeaturedCategoryCard key={category.id} category={category} />
        ))}
        <Box aria-hidden sx={FeaturedCategoriesCarouselStyle.trackSpacer} />
      </Box>
    </Box>
  );
}
