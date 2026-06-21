export const FeaturedCategoriesCarouselStyle = {
  root: {
    borderTop: "1px solid",
    borderBottom: "1px solid",
    borderColor: "divider",
    pt: { xs: 5, sm: 6 },
    pb: { xs: 4, sm: 5 },
  },

  // Scrollable card track — lives outside PageContainer so it spans full width
  track: {
    display: "flex",
    flexDirection: "row" as const,
    gap: 1.5,
    overflowX: "auto" as const,
    scrollSnapType: "x proximity",
    scrollBehavior: "smooth" as const,
    // Horizontal padding so first/last card aren't flush with the viewport edge
    px: { xs: 2, sm: 3, md: 4 },
    // pt gives cards headroom so hover scale/translateY doesn't get clipped by
    // the track's implicit overflow-y boundary (overflow-x:auto forces it non-visible)
    pt: 1.5,
    pb: 2,
    // Hide the scrollbar while keeping scroll functionality
    scrollbarWidth: "none" as const,
    "&::-webkit-scrollbar": { display: "none" },
    msOverflowStyle: "none" as const,
  },
} as const;
