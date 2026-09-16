/**
 * Print-document styling. Type sizes are in points (paper units); the values
 * are the design targets and may be tuned ±0.5pt for fit.
 *
 * The subtree owns its root reset — it must not rely on `CssBaseline` or the
 * `<html dir>` attribute, neither of which reaches the react-to-print iframe.
 * Colours use theme tokens (resolved against a forced light theme by the
 * component) rather than colour-only structural cues.
 */
export const RecipePrintDocumentStyle = {
  root: {
    color: "text.primary",
    bgcolor: "background.paper",
    fontSize: "10.5pt",
    lineHeight: 1.4,
    printColorAdjust: "exact",
    WebkitPrintColorAdjust: "exact",
    // Fluid flow only — no fixed heights / overflow / absolute positioning in
    // the subtree (these clip instead of paginating; feasibility F6).
    // Element resets are kept narrow: list styling is set per-list below so a
    // blanket `& ul` descendant rule (which always out-specifies a single
    // element class) can't clobber it.
    "& *": { boxSizing: "border-box" },
    "& h1, & h2, & h3, & p": { margin: 0 },
  },

  // ── Header (page 1) ──────────────────────────────────────────────────────
  // Flex row instead of the earlier float layout: `headerContent` (logo,
  // title, metadata) and the photo are two flex items, vertically centred on
  // a shared axis (`alignItems: "center"`) — the whole point being that
  // `headerContent`'s stack has real vertical room to grow *into* up to the
  // photo's own height (its tallest natural constraint) before this header
  // grows any taller and pushes the sections below it down. Plain `row`
  // resolves visually right-to-left under `dir="rtl"` with no logical-vs-
  // physical direction fuss, so `headerContent` (first in DOM) sits
  // inline-start (right) and the photo inline-end (left) — matching the
  // previous float layout's result. Safe to use flex here specifically
  // (elsewhere in this document, floats/blocks are used instead) because
  // `breakInside: "avoid"` already keeps the whole header on one page
  // regardless of its internal layout mechanism.
  header: {
    display: "flex",
    alignItems: "center",
    gap: "6mm",
    breakInside: "avoid",
    mb: "6mm",
  },
  headerContent: {
    flex: "1 1 auto",
    minWidth: 0,
  },
  logo: {
    display: "block",
    // Enlarged from 11mm, then 16mm, to 18mm: each bump was previously
    // absorbed by the floated photo's leftover height beside a short title.
    // Now that the metadata run lives in this same vertically-centred
    // column (see `header`), that's true by construction rather than by
    // coincidence — the column only pushes the sections below the header
    // down once its total height exceeds the photo's.
    height: "18mm",
    width: "auto",
    mb: "3mm",
  },
  photo: {
    flexShrink: 0,
    width: "55mm",
    maxWidth: "40%",
    aspectRatio: "3 / 2",
    objectFit: "cover",
    borderRadius: "4px",
    border: 1,
    borderColor: "divider",
  },
  title: {
    fontSize: "22pt",
    fontWeight: 800,
    lineHeight: 1.15,
    letterSpacing: "-0.02em",
  },

  // ── Metadata run ─────────────────────────────────────────────────────────
  // Lives directly under the title inside `headerContent` now (previously a
  // separate block below the whole header, `clear`ed past the floated
  // photo) — `mt` alone provides the gap from the title above it.
  metaRun: {
    breakInside: "avoid",
    fontSize: "9.5pt",
    lineHeight: 1.5,
    mt: "2mm",
  },
  metaLabel: {
    color: "text.secondary",
  },
  metaValue: {
    fontWeight: 700,
    color: "text.primary",
  },
  metaSeparator: {
    color: "text.secondary",
  },

  // ── Section (tips / equipment / ingredients / steps) ─────────────────────
  section: {
    mt: "6mm",
  },
  sectionHeadingBlock: {
    breakInside: "avoid",
    breakAfter: "avoid",
    mb: "2mm",
  },
  sectionHeading: {
    fontSize: "13pt",
    fontWeight: 700,
    lineHeight: 1.2,
  },
  // Honey accent rule — mirrors SectionHeaderStyle.accent geometry. Degrades
  // to a visible grey bar in a black-and-white print; carries no meaning
  // colour alone must convey.
  accent: {
    width: "28px",
    height: "3px",
    bgcolor: "warning.main",
    borderRadius: "1px",
    mt: "1.5mm",
  },

  groupSubheading: {
    fontSize: "11pt",
    fontWeight: 700,
    lineHeight: 1.3,
    mt: "3mm",
    mb: "1mm",
    // Belt-and-braces against a stranded subheading; the real guarantee is
    // the `keepWithStart` wrapper around subheading + first line(s).
    breakAfter: "avoid",
  },

  // ── Tips ────────────────────────────────────────────────────────────────
  tipList: {
    margin: 0,
    listStyle: "disc",
    listStylePosition: "outside",
    paddingInlineStart: "5mm",
  },
  tipItem: {
    breakInside: "avoid",
    display: "list-item",
    mb: "1.5mm",
  },

  // ── Equipment ───────────────────────────────────────────────────────────
  equipmentRun: {
    breakInside: "avoid",
  },

  // ── Ingredients ─────────────────────────────────────────────────────────
  ingredientGroup: {
    breakInside: "avoid",
    mt: "1mm",
  },
  // Inner wrapper (shared by ingredient and step groups): subheading + the
  // group's first line(s) are kept together so a subheading is never stranded
  // at a page foot (feasibility F6; brief AC "no group heading alone at the
  // bottom of a page").
  keepWithStart: {
    breakInside: "avoid",
  },
  ingredientList: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    mt: "1mm",
  },
  ingredientLine: {
    display: "flex",
    gap: "1.5mm",
    breakInside: "avoid",
    mb: "1.3mm",
  },
  ingredientAmount: {
    flexShrink: 0,
    fontVariantNumeric: "tabular-nums",
  },
  // The name/note block is the flex child that wraps — its wrapped lines hang
  // under the name, not under the amount.
  ingredientName: {
    minWidth: 0,
  },
  ingredientNote: {
    fontSize: "9.5pt",
    color: "text.secondary",
  },

  // ── Steps ───────────────────────────────────────────────────────────────
  stepGroup: {
    breakInside: "avoid",
    mt: "1mm",
  },
  stepList: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    mt: "1mm",
  },
  stepItem: {
    display: "flex",
    gap: "2mm",
    breakInside: "avoid",
    mb: "2mm",
  },
  stepNumber: {
    flexShrink: 0,
    fontWeight: 700,
    fontVariantNumeric: "tabular-nums",
  },
  stepText: {
    minWidth: 0,
  },
} as const;
