"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { PageContainer, SectionHeader, LoadingState, ErrorState, FreckleDust } from "@/components/shared";
import { useCategories } from "@/features/category/hooks";
import FeaturedCategoryCard from "../FeaturedCategoryCard";
import { FeaturedCategoriesCarouselStyle } from "./FeaturedCategoriesCarousel.style";
import { FeaturedCategoriesCarouselText } from "./FeaturedCategoriesCarousel.consts";

const MAX_CATEGORIES = 10;
const FADE_ZONE = 56;
const FADE_WIDTH = 72;
const SCROLL_AMOUNT = 440; // ~2 cards (200px + 16px gap = 216px each)
const DRAG_THRESHOLD = 5; // px movement before a drag is registered

type Props = {
  sectionTitle?: string | null;
};

export default function FeaturedCategoriesCarousel({ sectionTitle }: Props) {
  const { data: categories = [], isLoading, isError } = useCategories();
  const trackRef = useRef<HTMLDivElement>(null);
  const [rightFade, setRightFade] = useState(0);
  const [leftFade, setLeftFade] = useState(0);

  // Drag state kept in refs — no re-render on every pointer move
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);
  const hasDraggedRef = useRef(false);

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
      // In RTL, scrollLeft is 0 at the right (start) and goes negative scrolling toward the left (end).
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
  }, [isLoading]);

  // In RTL: scrollBy({ left: +n }) scrolls right (toward start); scrollBy({ left: -n }) scrolls left (toward end).
  const scrollTowardStart = useCallback(() => {
    trackRef.current?.scrollBy({ left: SCROLL_AMOUNT, behavior: "smooth" });
  }, []);

  const scrollTowardEnd = useCallback(() => {
    trackRef.current?.scrollBy({ left: -SCROLL_AMOUNT, behavior: "smooth" });
  }, []);

  // ── Drag-to-scroll (desktop mouse) ────────────────────────────────────────

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // left button only
    const el = trackRef.current;
    if (!el) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    dragStartXRef.current = e.clientX;
    dragStartScrollRef.current = el.scrollLeft;
    // Pointer capture is set lazily in handlePointerMove once a real drag is confirmed.
    // Setting it here (eagerly) causes browsers to fire click on the track rather than on
    // child link elements, which breaks card navigation.
    el.style.scrollBehavior = "auto"; // instant response during drag
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const el = trackRef.current;
    if (!el) return;
    const dx = e.clientX - dragStartXRef.current;
    if (Math.abs(dx) > DRAG_THRESHOLD) {
      hasDraggedRef.current = true;
      // Capture lazily — only once drag is confirmed — so simple clicks are unaffected and
      // the drag continues even if the pointer leaves the track bounds.
      if (!el.hasPointerCapture(e.pointerId)) {
        el.setPointerCapture(e.pointerId);
        el.style.cursor = "grabbing";
      }
    }
    // RTL: pointer moves right (+dx) → scrollLeft increases toward 0 → content scrolls toward start. ✓
    el.scrollLeft = dragStartScrollRef.current + dx;
  }, []);

  const handlePointerUp = useCallback((_e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const el = trackRef.current;
    if (!el) return;
    el.style.cursor = "";
    el.style.scrollBehavior = ""; // restore smooth scroll
  }, []);

  // Capture-phase click handler: suppresses link navigation when the pointer was dragged.
  const handleClickCapture = useCallback((e: React.MouseEvent) => {
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      e.stopPropagation();
      e.preventDefault();
    }
  }, []);

  if (isLoading) return <LoadingState minHeight={320} />;
  if (isError) return <ErrorState description={FeaturedCategoriesCarouselText.errorLoad} />;
  if (categories.length === 0) return null;

  const featured = categories.slice(0, MAX_CATEGORIES);

  const rightPx = Math.round(rightFade * FADE_WIDTH);
  const leftPx = Math.round(leftFade * FADE_WIDTH);
  const hasMask = rightPx > 0 || leftPx > 0;
  const maskValue = hasMask
    ? `linear-gradient(to left, transparent 0px, black ${rightPx}px, black calc(100% - ${leftPx}px), transparent 100%)`
    : undefined;

  return (
    <Box sx={FeaturedCategoriesCarouselStyle.root}>
      <FreckleDust placement="corners" density="low" />
      <PageContainer sx={{ py: 0, pb: 0 }}>
        <SectionHeader title={sectionTitle ?? FeaturedCategoriesCarouselText.sectionTitle} sx={{ mb: 2.5 }} />

        <Box sx={FeaturedCategoriesCarouselStyle.trackWrapper}>
          {/* Left arrow — "previous" in RTL: scrolls content rightward toward start */}
          <IconButton
            onClick={scrollTowardStart}
            aria-label={FeaturedCategoriesCarouselText.prevAriaLabel}
            sx={[
              FeaturedCategoriesCarouselStyle.arrow,
              FeaturedCategoriesCarouselStyle.arrowLeft,
              {
                opacity: rightFade,
                pointerEvents: rightFade > 0 ? "auto" : "none",
              },
            ]}
          >
            <ChevronRightIcon />
          </IconButton>

          <Box
            ref={trackRef}
            sx={FeaturedCategoriesCarouselStyle.track}
            style={maskValue ? { maskImage: maskValue, WebkitMaskImage: maskValue } : undefined}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onClickCapture={handleClickCapture}
          >
            {featured.map((category) => (
              <FeaturedCategoryCard key={category.id} category={category} />
            ))}
          </Box>

          {/* Right arrow — "next" in RTL: scrolls content leftward toward end */}
          <IconButton
            onClick={scrollTowardEnd}
            aria-label={FeaturedCategoriesCarouselText.nextAriaLabel}
            sx={[
              FeaturedCategoriesCarouselStyle.arrow,
              FeaturedCategoriesCarouselStyle.arrowRight,
              {
                opacity: leftFade,
                pointerEvents: leftFade > 0 ? "auto" : "none",
              },
            ]}
          >
            <ChevronLeftIcon />
          </IconButton>
        </Box>
      </PageContainer>
    </Box>
  );
}
