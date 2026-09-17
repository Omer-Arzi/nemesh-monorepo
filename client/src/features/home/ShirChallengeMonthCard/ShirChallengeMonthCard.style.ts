export const ShirChallengeMonthCardStyle = {
  card: {
    width: 240,
    height: 300,
    display: "flex",
    flexDirection: "column" as const,
    borderRadius: 3,
    overflow: "hidden" as const,
    flexShrink: 0,
    scrollSnapAlign: "start" as const,
    transition: "box-shadow 250ms ease",
    "&:hover": {
      boxShadow: "0 8px 24px rgba(193, 123, 60, 0.18), 0 2px 6px rgba(193, 123, 60, 0.10)",
    },
    // Image zoom on card hover — same treatment as RecipeCardStyle.card.
    "& .ShirChallengeMonthCard-image": {
      transition: "transform 0.5s ease",
    },
    "&:hover .ShirChallengeMonthCard-image": {
      transform: "scale(1.04)",
    },
  },
  actionArea: {
    height: "100%",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "stretch",
  },

  // Fixed 160px image zone (both matched and placeholder states) — same
  // aspect ratio as RecipeCardStyle.imageZone.
  imageZone: {
    position: "relative" as const,
    height: 160,
    aspectRatio: "3 / 2",
    overflow: "hidden" as const,
    bgcolor: "action.hover",
    flexShrink: 0,
  },

  // Shared structural pattern for "no photo" (matched, image missing) and
  // "coming soon" (current-month placeholder) — same shell, different icon/copy.
  noImageState: {
    position: "absolute" as const,
    inset: 0,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: 0.75,
    bgcolor: "surface.placeholder",
  },
  noImageIcon: {
    fontSize: 34,
    color: "secondary.main",
  },
  noImageText: {
    fontSize: "0.68rem",
    color: "text.secondary",
    letterSpacing: "0.03em",
  },

  // Fixed 140px content zone — vertically centered so a 2-row placeholder and
  // a 3-row matched card both stay visually uniform in the same carousel row.
  content: {
    height: 140,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: 0.75,
    px: 2,
    py: 1.5,
  },

  // Headline slot: recipe title (matched) or month label (placeholder).
  title: {
    fontWeight: 700,
    textAlign: "center" as const,
    lineHeight: 1.35,
    // Reserve exactly 2 lines so caption/meta rows align at the same Y
    // regardless of title length — same technique as RecipeCardStyle.title.
    minHeight: "2.7em",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical" as const,
    overflow: "hidden" as const,
  },

  // Caption slot: month dateline (matched) or "המתכון בדרך" (placeholder) —
  // typographic register matches ChallengeStatusCardStyle.rowLabel.
  caption: {
    fontSize: "0.78rem",
    color: "text.secondary",
    fontWeight: 600,
    letterSpacing: "0.02em",
  },

  // Meta slot (matched card only): the month's challenge ingredient, in
  // place of RecipeCard's usual prep-time stat — same body2/text.secondary
  // weight as RecipeMeta's stat text, single line with ellipsis overflow.
  ingredientMeta: {
    fontSize: "0.8125rem",
    color: "text.secondary",
    textAlign: "center" as const,
    whiteSpace: "nowrap" as const,
    overflow: "hidden" as const,
    textOverflow: "ellipsis" as const,
    maxWidth: "100%",
  },
} as const;
