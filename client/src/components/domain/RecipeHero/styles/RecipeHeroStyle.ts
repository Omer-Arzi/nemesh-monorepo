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
    // Asymmetric at md+: a tighter lower inset so the metadata row (which has
    // its own top margin, see `metaRow`) doesn't leave a wide dead band below
    // itself before the hero's edge. xs keeps the even 3/3.
    pt: { xs: 3, md: 4 },
    pb: { xs: 3, md: 2.5 },
    mb: 3,
  },

  // Outer flow container: `imageColumn` then `contentColumn`, in that DOM
  // order — the image must come first so it can `float` at `md+` and have
  // the content that follows wrap around it, then continue at the full row
  // width once past its bottom edge. CSS Grid (the previous mechanism)
  // can't do this: its two tracks are independent static allocations, so
  // text overflowing one just kept growing downward in that same narrow
  // column instead of reclaiming the row's full width once past the
  // (now-shorter) image column.
  //
  // At `xs`/`sm` this stays a single-column grid — `imageColumn`'s `order`
  // restores today's visual stacking (content, then image), since the
  // DOM-first image has no visual meaning there (no float is active below
  // `md`).
  //
  // `flow-root` (not plain `block`) at `md+` is load-bearing, not cosmetic:
  // a floated child alone doesn't contribute to a normal block's auto
  // height, so without a box that explicitly contains its floats, this
  // container would collapse to just `contentColumn`'s height whenever the
  // image is taller than the (short, collapsed) content — clipping the
  // image's lower portion under `root`'s own `overflow: hidden`.
  layout: {
    display: { xs: "grid", md: "flow-root" },
    gridTemplateColumns: { xs: "1fr" },
    gap: { xs: 3 },
    maxWidth: 960,
    mx: "auto",
  },

  // 3:2 aspect ratio. borderRadius: 4 = 16px for a softer, premium frame.
  // `order` only matters at `xs`/`sm` (see `layout`). The `md+` float width
  // reproduces the previous grid's 4fr-of-(100%-gap) column via calc(), so
  // it scales identically at any desktop width and freezes at the same
  // point once `layout`'s own `maxWidth: 960` caps growth on large
  // monitors — nothing here is tuned to one viewport. `float: "inline-end"`
  // (a CSS *logical* value, not "left"/"right") resolves the correct
  // physical side natively from `dir="rtl"`, sidestepping any dependence on
  // whether stylis-plugin-rtl's generic text-token flip actually rewrites
  // physical float values (unverified for this property, unlike the
  // margin/inset logical properties already used elsewhere in this
  // codebase for the same reason).
  imageColumn: {
    order: { xs: 1 },
    position: "relative",
    float: { md: "inline-end" },
    width: { md: "calc((100% - 40px) * 4 / 9)" },
    marginInlineStart: { md: "40px" },
    // Portrait/stacked at xs. At md+ the image is floated and the divider
    // below it must `clear`, so a tall image leaves an empty band above the
    // divider when the badge/title/description is short. `16 / 9` is the
    // compromise crop: noticeably taller than a `2 / 1` letterbox (the image
    // still reads as a real photo, not a strip) while staying shallow enough
    // that a typical badge+title+short-description column reaches close to its
    // lower edge. `objectFit: cover` on the fill image handles the crop for
    // any source photo.
    aspectRatio: { xs: "3 / 2", md: "16 / 9" },
    overflow: "hidden",
    borderRadius: 4,
    bgcolor: "background.paper",
    border: 1,
    borderColor: "divider",
    // Warm inset shadow gives the image depth and a premium framed quality.
    boxShadow: "inset 0 0 0 1px rgba(193, 123, 60, 0.10)",
  },

  // Applied at md+ when the recipe has no photo: the "no image" placeholder
  // doesn't need the full 2:1 height, and a tall empty box only widens the
  // band the metadata footer's `clear` has to skip past (see `metaFooter`).
  // At xs the stacked placeholder keeps its normal 3:2.
  imageColumnEmpty: {
    aspectRatio: { md: "9 / 2" },
  },

  // Badge/title/description/meta-stats. At `xs`/`sm` this is a flex column
  // (unchanged from before). At `md+` it's plain `block` — deliberately
  // NOT a block-formatting-context (no `overflow`/`flow-root`/etc) — so it
  // stays "transparent" to the float: its own box doesn't dodge the image
  // as one rigid unit for its whole height, but each child's line boxes
  // individually wrap around the image, exactly as if they were direct
  // siblings of it.
  contentColumn: {
    display: { xs: "flex", md: "block" },
    flexDirection: { xs: "column" },
    gap: { xs: 1.5 },
  },

  badge: {
    alignSelf: { xs: "flex-start" },
    // A flex item (xs) is always "blockified" regardless of its own
    // `display`, so this only matters once `contentColumn` becomes plain
    // `block` at md+ — without it this bare <span>'s vertical padding
    // wouldn't reserve real line-height space, risking overlap with the
    // title.
    display: "inline-block",
    bgcolor: "primary.main",
    color: "primary.contrastText",
    px: 1.75,
    py: 0.5,
    borderRadius: 1.5,
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "0.07em",
    textTransform: "uppercase" as const,
    mb: { md: 2 },
  },

  title: {
    fontWeight: 800,
    lineHeight: 1.15,
    letterSpacing: "-0.02em",
    fontSize: { xs: "1.75rem", md: "2.25rem", lg: "2.75rem" },
    mb: { md: 2 },
  },

  descriptionWrapper: {
    mb: { md: 2 },
  },

  // Collapsed preview: native line-clamp does the truncation — the browser
  // measures actual rendered lines, so it's correct regardless of RTL, width,
  // or font, and always places the ellipsis at a real line boundary (no
  // character-count guessing, no orphaned fragment). whiteSpace: "normal"
  // (not "pre-line") so an embedded paragraph break landing inside the
  // clamped lines reads as flowing text instead of a blank line.
  //
  // Also used (harmlessly — line-clamp is a no-op when content already
  // fits) whenever the description isn't actually overflowing, so short
  // descriptions keep this same narrow reading width forever instead of
  // ever picking up `descriptionExpanded`'s wider, unconstrained width —
  // see `useWideFlow` in RecipeHero.tsx.
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

  // True expanded flow — only ever applied once a genuinely-overflowing
  // description is actually expanded (`useWideFlow` in RecipeHero.tsx).
  // No maxWidth at md+: the reading width beside the image comes entirely
  // from the image's own `float` geometry above, and once the text passes
  // the image's bottom edge it's free to use the full row width — exactly
  // like `title`, which has never had a maxWidth here and already wraps at
  // that same beside-image width. `overflow`/`clipPath` are applied
  // per-instance in RecipeHero.tsx rather than baked in here: `overflow:
  // hidden` would establish a block-formatting-context, which stops a box
  // from wrapping a preceding float altogether (its whole rectangle would
  // dodge the image instead of just its line boxes) — the opposite of what
  // this state needs.
  descriptionExpanded: {
    color: "text.secondary",
    lineHeight: 1.7,
    maxWidth: { xs: 400, md: "none" },
    whiteSpace: "pre-line" as const,
  },

  // `clear: "both"` guarantees the divider (and, since block flow is
  // strictly sequential, metaRow after it) always renders below the image
  // regardless of whether the float or the flowing description ends lower.
  // Contains no "left"/"right" token, so it's unaffected by
  // stylis-plugin-rtl and is direction-agnostic by construction. Per
  // CSS2.1 margin-collapsing rules, a cleared element's own top margin
  // never collapses with the preceding sibling's bottom margin, so the
  // rendered gap above the divider is `descriptionWrapper`'s mb (16px at
  // md) plus this `my`'s top value (6px) = 22px — identical to today's
  // contentColumn gap (16px) + divider my-top (6px).
  divider: {
    borderColor: "divider",
    my: 0.75,
  },

  // Wraps the divider + stat/action row. `clear: "both"` keeps the block
  // below the floated image at md+ (a full-width rule flowing beside the
  // float would collapse to a stub). The divider therefore can't sit higher
  // than the image's lower edge — the empty band above it is governed by the
  // image height (see `imageColumn`'s md aspect ratio, kept shallow so a
  // short badge/title/description doesn't leave a large gap here). At xs
  // there is no float.
  metaFooter: {
    clear: { md: "both" },
  },

  // `alignItems: "center"` puts every item on the row — the stat chips AND
  // the `action` control — on one shared vertical centre line, so the
  // shorter print pill is not top-aligned against the taller chips.
  // `mt` at md+ opens a modest gap above the row (roughly matching the gap
  // that falls below it, from the hero's bottom padding) so the row reads as
  // sitting between the divider and the hero's lower edge rather than pinned
  // tight under the divider — without inflating the hero with dead space.
  metaRow: {
    display: "flex",
    alignItems: "center",
    gap: { xs: 1.5, md: 2 },
    flexWrap: "wrap" as const,
    mt: { md: 2 },
  },

  // Print control (or any `action`) sharing the metadata row. Vertical
  // centring with the chips comes from `metaRow`'s `alignItems: "center"`.
  // At md+ it is pushed to the row's inline-end (visual-left in RTL). On
  // mobile `flexBasis: 100%` drops it onto its own line below the chips,
  // where `display: flex` keeps the button anchored to the inline-start edge.
  actionSlot: {
    display: "flex",
    flexBasis: { xs: "100%", md: "auto" },
    marginInlineStart: { md: "auto" },
    mt: { xs: 0.5, md: 0 },
  },

  // Fallback home when the hero has no metadata stats: below the description,
  // above where the divider would sit.
  actionSlotNoStats: {
    alignSelf: "flex-start",
    mt: { xs: 1.5, md: 2 },
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
} as const;
