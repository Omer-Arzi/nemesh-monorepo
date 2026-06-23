export const FeaturedCategoriesCarouselStyle = {
  root: {
    borderTop: "1px solid",
    borderBottom: "1px solid",
    borderColor: "divider",
    pt: { xs: 5, sm: 6 },
    pb: { xs: 4, sm: 5 },
  },

  // Scrollable card track — sits inside PageContainer so it inherits the same
  // horizontal safe area as the section title. PageContainer's padding and
  // max-width are the true boundaries; no spacer hacks needed.
  // Edge fades are applied via maskImage in the component based on scroll position.
  track: {
    display: "flex",
    flexDirection: "row" as const,
    gap: 2,
    overflowX: "auto" as const,
    scrollSnapType: "x proximity",
    scrollBehavior: "smooth" as const,
    // pt gives cards headroom so hover scale/translateY isn't clipped by the
    // track's implicit overflow-y boundary (overflow-x:auto forces it non-visible)
    pt: 2,
    pb: 2.5,
    // Hide the scrollbar while keeping scroll functionality
    scrollbarWidth: "none" as const,
    "&::-webkit-scrollbar": { display: "none" },
    msOverflowStyle: "none" as const,
  },
} as const;
