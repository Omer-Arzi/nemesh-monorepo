"use client";

import { useRef, useState, useEffect } from "react";
import Box from "@mui/material/Box";
import { PageContainer, SectionHeader, LoadingState, ErrorState } from "@/components/shared";
import { useCategories } from "@/features/category/hooks";
import FeaturedCategoryCard from "../FeaturedCategoryCard";
import { FeaturedCategoriesCarouselStyle } from "./FeaturedCategoriesCarousel.style";

const MAX_CATEGORIES = 10;
const FADE_ZONE = 56;
const FADE_WIDTH = 72;

export default function FeaturedCategoriesCarousel() {
  const { data: categories = [], isLoading, isError } = useCategories();
  const trackRef = useRef<HTMLDivElement>(null);
  const [rightFade, setRightFade] = useState(0);
  const [leftFade, setLeftFade] = useState(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const check = () => {
      const hasOverflow = el.scrollWidth > el.clientWidth;
      if (!hasOverflow) {
        setRightFade(0);
        setLeftFade(0);
        return;
      }
      // In RTL, scrollLeft is 0 at the right (start) and goes negative scrolling toward the left.
      const scrolled = Math.abs(el.scrollLeft);
      const maxScroll = el.scrollWidth - el.clientWidth;
      setRightFade(Math.min(1, scrolled / FADE_ZONE));
      setLeftFade(Math.min(1, (maxScroll - scrolled) / FADE_ZONE));
    };

    check();
    el.addEventListener("scroll", check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", check);
      ro.disconnect();
    };
  // Re-run once loading finishes so trackRef.current is the real DOM element.
  }, [isLoading]);

  if (isLoading) return <LoadingState minHeight={320} />;
  if (isError) return <ErrorState description="לא הצלחנו לטעון קטגוריות." />;
  if (categories.length === 0) return null;

  const featured = categories.slice(0, MAX_CATEGORIES);

  // Build a CSS mask that fades both edges of the track based on scroll position.
  // mask-image is applied to the track itself so it clips the card content directly —
  // no stacking context issues, no sibling overlay elements needed.
  const rightPx = Math.round(rightFade * FADE_WIDTH);
  const leftPx = Math.round(leftFade * FADE_WIDTH);
  const hasMask = rightPx > 0 || leftPx > 0;
  const maskValue = hasMask
    ? `linear-gradient(to left, transparent 0px, black ${rightPx}px, black calc(100% - ${leftPx}px), transparent 100%)`
    : undefined;

  return (
    <Box sx={FeaturedCategoriesCarouselStyle.root}>
      <PageContainer sx={{ py: 0, pb: 0 }}>
        <SectionHeader title="קטגוריות מובילות" sx={{ pb: 3 }} />
        <Box
          ref={trackRef}
          sx={FeaturedCategoriesCarouselStyle.track}
          style={maskValue ? { maskImage: maskValue, WebkitMaskImage: maskValue } : undefined}
        >
          {featured.map((category) => (
            <FeaturedCategoryCard key={category.id} category={category} />
          ))}
        </Box>
      </PageContainer>
    </Box>
  );
}
