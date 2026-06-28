export const RecipeCardStyle = {
  card: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    borderRadius: 3,
    overflow: "hidden",
    transition: "box-shadow 200ms ease",
    "&:hover": {
      boxShadow: 6,
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
  imageFallback: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  imageFallbackIcon: {
    fontSize: 64,
    color: "text.disabled",
    opacity: 0.4,
  },
  content: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 1.5,
    pt: 2,
    pb: "16px !important",
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
    gap: 0.75,
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
    fontSize: "0.7rem",
    height: 20,
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
