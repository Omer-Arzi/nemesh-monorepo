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
  // Wraps `title` so a one-line title can be vertically centered within the
  // reserved 2-line box. `-webkit-box-pack` (tried first) is a no-op here —
  // `-webkit-line-clamp` is a text-truncation hack layered on the legacy
  // `-webkit-box` model, not a real flex container with redistributable
  // children, so `-webkit-box-pack` has nothing to act on. A real flex
  // wrapper around the clamped text is the reliable mechanism.
  titleWrapper: {
    display: "flex",
    alignItems: "center",
    // Reserve exactly 2 lines so all cards align their metadata at the same Y.
    minHeight: "2.7em",
    width: "100%",
  },
  title: {
    fontWeight: 700,
    textAlign: "center",
    lineHeight: 1.35,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    width: "100%",
  },
  // Wraps RecipeMeta so 0/1/2-stat and 1-line/2-line-wrapped meta all occupy the same
  // vertical space — same reserved-space technique as titleWrapper above.
  // minHeight measured live via getBoundingClientRect against RecipeMeta's real rendered
  // tokens (not guessed): each stat line is 16px (RecipeMetaStyle.statIcon's fontSize:16/
  // lineHeight:1 icon box, matched by statText's body2 rendered at 16px with the
  // component's own lineHeight:1 override — both confirmed via computed style), with a
  // 12px row gap between wrapped lines (RecipeMetaStyle.root's gap:1.5 = 12px, confirmed
  // via computed rowGap) → 2 * 16 + 12 = 44px. Deliberately reserved for the common 1-2
  // line case, not the rare 3-4 line wrap real data can hit in the ~900-950px sm→md grid
  // pinch (measured up to 88px there) — reserving further would pad every card with visible
  // empty space under a 1-line meta at every other width just to cover that narrow band.
  // The pinch band still grows past this minHeight when content needs it (minHeight is a
  // floor, not a cap) — verified that growth applies uniformly to the whole grid row rather
  // than mismatching siblings. See implementation handoff for the measured tradeoff.
  metaWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    minHeight: "44px",
  },
  categoriesRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 0.5,
    justifyContent: "center",
    // MUI's documented default height for a small Chip — reserves 1 line so a
    // 0-category recipe takes the same space as one with chips. Same "reserve the common
    // case, let the rare pinch-width wrap grow past it" tradeoff as metaWrapper above.
    minHeight: 24,
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
    // Matches tagChip.height below — reserves 1 line so a 0-tag recipe takes the
    // same space as one with chips. Same tradeoff as categoriesRow above.
    minHeight: 18,
  },
  tagChip: {
    fontSize: "0.65rem",
    height: 18,
    color: "text.secondary",
    bgcolor: "action.hover",
    border: "none",
    // Chip padding lives on the inner label, not the root — measured current
    // computed padding was 0px 8px; nudged ~1px per axis to 1px 9px.
    "& .MuiChip-label": {
      paddingInline: "9px",
      paddingBlock: "1px",
    },
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
    width: "100%",
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    // Reserve 3 lines (this row's overflow-safety cap) using body2's own configured
    // lineHeight (1.5, see lib/theme/typography.ts) — same em-multiple technique as
    // titleWrapper's 2.7em above (1.5 * 3 = 4.5em), no separate measurement needed since
    // em compounds directly off this element's own font-size at any breakpoint.
    minHeight: "4.5em",
  },
} as const;
