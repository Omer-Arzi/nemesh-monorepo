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
  content: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 1,
    pt: 2,
    pb: "16px !important",
    px: 2,
  },

  metaRow: {
    display: "flex",
    gap: 1.5,
    justifyContent: "center",
    mt: 0.5,
  },
} as const;
