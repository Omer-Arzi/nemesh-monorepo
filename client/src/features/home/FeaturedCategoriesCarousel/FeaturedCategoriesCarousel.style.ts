export const FeaturedCategoriesCarouselStyle = {
  // surface.alt band creates a page rhythm — clearly distinct from the parchment
  // page background and the near-white cards in the sections around it.
  root: {
    position: "relative" as const,
    overflow: "hidden" as const,
    bgcolor: "surface.alt",
    borderTop: "1px solid",
    borderBottom: "1px solid",
    borderColor: "divider",
    pt: { xs: 4, sm: 5, md: 6 },
    pb: { xs: 4, sm: 5 },
  },

  // Wraps the track + absolute-positioned arrows. position:relative is the
  // anchor for the arrows; no overflow set so arrows can bleed to the edges.
  trackWrapper: {
    position: "relative" as const,
  },

  // Scrollable card track. Edge fades applied via maskImage in the component.
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
    scrollbarWidth: "none" as const,
    "&::-webkit-scrollbar": { display: "none" },
    msOverflowStyle: "none" as const,
    // Grab cursor signals drag affordance to desktop mouse users
    cursor: "grab",
    "&:active": { cursor: "grabbing" },
  },

  // Base style shared by both arrow buttons — desktop only.
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

  // Right arrow — sits at the right edge, navigates toward start of list (RTL).
  arrowRight: {
    right: 0,
  },

  // Left arrow — sits at the left edge, navigates toward end of list (RTL).
  arrowLeft: {
    left: 0,
  },
} as const;
