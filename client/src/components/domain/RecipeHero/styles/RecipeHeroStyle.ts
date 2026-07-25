export const RecipeHeroStyle = {
  // background.paper (white) lifts the hero above the warm candlelight page.
  // mb: 3 softens the jump from the hero shadow into the recipe body below.
  root: {
    position: "relative" as const,
    overflow: "hidden" as const,
    bgcolor: "background.paper",
    borderTop: 4,
    borderBottom: 1,
    borderColor: "divider",
    borderTopColor: "primary.main",
    boxShadow: 3,
    px: { xs: 3, md: 4, lg: 6 },
    py: { xs: 3, md: 4 },
    mb: 3,
  },

  // RTL: column 1 is visually RIGHT (content), column 2 is visually LEFT (image).
  // 5:4 split gives the content column more room than the image.
  //
  // alignItems: "start" (not "center") — the image has a fixed aspect ratio
  // while the content column's height varies as the description expands or
  // collapses. Centering would re-anchor both columns to the row's midpoint
  // every time that height changes, visibly shifting the image and title.
  // Top-anchoring both columns keeps them stable; only the empty space below
  // the shorter column changes, which is invisible.
  grid: {
    display: "grid",
    gridTemplateColumns: { xs: "1fr", md: "5fr 4fr" },
    gap: { xs: 3, md: 5 },
    alignItems: "start",
    maxWidth: 960,
    mx: "auto",
  },

  contentColumn: {
    display: "flex",
    flexDirection: "column",
    gap: { xs: 1.5, md: 2 },
  },

  badge: {
    alignSelf: "flex-start",
    bgcolor: "primary.main",
    color: "primary.contrastText",
    px: 1.75,
    py: 0.5,
    borderRadius: 1.5,
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "0.07em",
    textTransform: "uppercase" as const,
  },

  title: {
    fontWeight: 800,
    lineHeight: 1.15,
    letterSpacing: "-0.02em",
    fontSize: { xs: "1.75rem", md: "2.25rem", lg: "2.75rem" },
  },

  // Collapsed preview: native line-clamp does the truncation — the browser
  // measures actual rendered lines, so it's correct regardless of RTL, width,
  // or font, and always places the ellipsis at a real line boundary (no
  // character-count guessing, no orphaned fragment). whiteSpace: "normal"
  // (not "pre-line") so an embedded paragraph break landing inside the
  // clamped lines reads as flowing text instead of a blank line.
  descriptionClamp: {
    display: "-webkit-box" as const,
    WebkitBoxOrient: "vertical" as const,
    // Number of lines shown before truncating.
    WebkitLineClamp: 4,
    overflow: "hidden" as const,
    color: "text.secondary",
    lineHeight: 1.7,
    maxWidth: 400,
    whiteSpace: "normal" as const,
  },

  // Expanded (or short, never-truncated) reading view — real paragraph
  // structure from Strapi's richtext field is preserved via pre-line.
  descriptionExpanded: {
    color: "text.secondary",
    lineHeight: 1.7,
    maxWidth: 400,
    whiteSpace: "pre-line" as const,
  },

  divider: {
    borderColor: "divider",
    my: 0.75,
  },

  metaRow: {
    display: "flex",
    gap: { xs: 1.5, md: 2 },
    flexWrap: "wrap" as const,
  },

  statChip: {
    bgcolor: "background.default",
    border: 1,
    borderColor: "divider",
    borderRadius: 2,
    px: 1.5,
    py: 1,
    minWidth: 64,
  },

  statLabel: {
    display: "block",
    color: "text.secondary",
    fontSize: "0.65rem",
    fontWeight: 500,
    textTransform: "uppercase" as const,
    letterSpacing: "0.09em",
    mb: 0.3,
  },

  statValue: {
    fontWeight: 700,
    fontSize: "0.95rem",
    lineHeight: 1.2,
    color: "primary.main",
  },

  // ── No-image placeholder ─────────────────────────────────────────────────
  noImageState: {
    position: "absolute" as const,
    inset: 0,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
    bgcolor: "surface.placeholder",
  },
  noImageIcon: {
    fontSize: 52,
    color: "secondary.main",
  },
  noImageText: {
    fontSize: "0.75rem",
    color: "text.secondary",
    letterSpacing: "0.03em",
  },

  // 3:2 aspect ratio. borderRadius: 4 = 16px for a softer, premium frame.
  imageColumn: {
    position: "relative",
    aspectRatio: "3 / 2",
    overflow: "hidden",
    borderRadius: 4,
    bgcolor: "background.paper",
    border: 1,
    borderColor: "divider",
    // Warm inset shadow gives the image depth and a premium framed quality.
    boxShadow: "inset 0 0 0 1px rgba(193, 123, 60, 0.10)",
  },

} as const;
