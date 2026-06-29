export const RecipeCardStyle = {
  card: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    borderRadius: 3,
    overflow: "hidden",
    transition: "box-shadow 250ms ease",
    "&:hover": {
      boxShadow: "0 8px 24px rgba(193, 123, 60, 0.18), 0 2px 6px rgba(193, 123, 60, 0.10)",
    },
    // Image zoom on card hover — targets the NemeshImage wrapper div (className in RecipeCard.tsx).
    // The img inside NemeshImage carries an inline opacity transition that would override
    // a stylesheet rule targeting img directly, so we scale the wrapper instead.
    "& .RecipeCard-image": {
      transition: "transform 0.5s ease",
    },
    "&:hover .RecipeCard-image": {
      transform: "scale(1.04)",
    },
  },
  actionArea: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
  imageZone: {
    position: "relative",
    aspectRatio: "3 / 2",
    overflow: "hidden",
    bgcolor: "action.hover",
    flexShrink: 0,
  },

  // ── No-image branded placeholder ─────────────────────────────────────────
  noImageState: {
    position: "absolute" as const,
    inset: 0,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: 0.75,
    bgcolor: "action.selected",
  },
  noImageIcon: {
    fontSize: 34,
    color: "primary.main",
    opacity: 0.55,
  },
  noImageText: {
    fontSize: "0.68rem",
    color: "text.secondary",
    letterSpacing: "0.03em",
  },

  content: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 1,
    pt: 1.5,
    pb: "12px !important",
    px: 2,
  },
  title: {
    fontWeight: 700,
    textAlign: "center",
    lineHeight: 1.35,
    // Reserve exactly 2 lines so all cards align their metadata at the same Y.
    minHeight: "2.7em",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  categoriesRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 0.5,
    justifyContent: "center",
  },
  overflowChip: {
    color: "text.disabled",
    borderColor: "divider",
  },
  tagsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 0.5,
    justifyContent: "center",
  },
  tagChip: {
    fontSize: "0.65rem",
    height: 18,
    color: "text.secondary",
    bgcolor: "action.hover",
    border: "none",
  },

  // ── Small variant ────────────────────────────────────────────────────────
  smallContent: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 0.75,
    pt: 1.5,
    pb: "12px !important",
    px: 1.5,
  },
  smallMeta: {
    textAlign: "center",
    color: "text.secondary",
  },
} as const;
