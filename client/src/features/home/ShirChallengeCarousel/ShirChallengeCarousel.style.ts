// Mirrors FeaturedCategoriesCarouselStyle's shell exactly (drag-scroll, RTL,
// fades, arrows) — no new interaction pattern. bgcolor deliberately differs:
// homepage order is LatestRecipes (background.paper) → this section →
// FeaturedCategoriesCarousel (surface.alt) — three bands back-to-back can't
// share a color with either neighbor, so this one uses background.default
// (the page's own parchment tone) framed only by the divider borders below,
// rather than reusing either neighbor's fill.
export const ShirChallengeCarouselStyle = {
  root: {
    position: "relative" as const,
    overflow: "hidden" as const,
    bgcolor: "background.default",
    borderTop: "1px solid",
    borderBottom: "1px solid",
    borderColor: "divider",
    pt: { xs: 4, sm: 5, md: 6 },
    pb: { xs: 4, sm: 5 },
  },

  trackWrapper: {
    position: "relative" as const,
  },

  track: {
    display: "flex",
    flexDirection: "row" as const,
    gap: 2,
    overflowX: "auto" as const,
    scrollSnapType: "x proximity",
    scrollBehavior: "smooth" as const,
    pt: 2,
    pb: 2.5,
    scrollbarWidth: "none" as const,
    "&::-webkit-scrollbar": { display: "none" },
    msOverflowStyle: "none" as const,
    cursor: "grab",
    "&:active": { cursor: "grabbing" },
  },

  arrow: {
    display: { xs: "none", md: "flex" },
    position: "absolute" as const,
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 2,
    width: 40,
    height: 40,
    bgcolor: "background.paper",
    border: "1px solid",
    borderColor: "divider",
    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
    transition: "opacity 0.2s ease, background-color 0.15s ease",
    "&:hover": { bgcolor: "action.hover" },
  },

  arrowRight: {
    right: 0,
  },

  arrowLeft: {
    left: 0,
  },
} as const;
