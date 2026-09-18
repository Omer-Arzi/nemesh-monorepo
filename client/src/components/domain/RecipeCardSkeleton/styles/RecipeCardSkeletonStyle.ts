export const RecipeCardSkeletonStyle = {
  card: {
    height: "100%",
    borderRadius: 3,
    overflow: "hidden",
  },

  // Mirrors RecipeCard.imageZone — position:relative + aspect ratio so the
  // absolute-positioned Skeleton fills the same space as the real image.
  imageZone: {
    position: "relative" as const,
    aspectRatio: "3 / 2",
  },

  imageSkeleton: {
    position: "absolute" as const,
    inset: 0,
    width: "100%",
    height: "100%",
  },

  // Mirrors RecipeCard.content so card heights align during the skeleton→card swap.
  // pt/pb/gap match RecipeCardStyle.content exactly (same values, not just "close").
  content: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 1,
    pt: 1.5,
    pb: "12px !important",
    px: 2,
  },

  // Each zone below reserves the same minHeight as its real-card counterpart in
  // RecipeCardStyle (titleWrapper / metaWrapper / categoriesRow / tagsRow) — the shapes
  // inside don't need to match (no chip placeholders required), only the reserved sum.
  titleZone: {
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
    gap: 0.5,
    minHeight: "2.7em",
    width: "100%",
  },
  metaZone: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 1.5,
    minHeight: "44px",
    width: "100%",
  },
  categoriesZone: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "24px",
    width: "100%",
  },
  tagsZone: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "18px",
    width: "100%",
  },
} as const;
