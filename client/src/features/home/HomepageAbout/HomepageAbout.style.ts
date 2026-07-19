export const HomepageAboutStyle = {
  // Section band — compact vertical rhythm; this is a secondary homepage element.
  section: {
    py: { xs: 3, sm: 3.5, md: 4 },
    bgcolor: "background.paper",
  },

  // Editorial card: constrained max width, centred within PageContainer.
  // Height is driven entirely by content — no fixed or minimum heights.
  // py is slightly taller than px (was a uniform `p`) — the flex conversion
  // left heading/body sitting flush against the top/bottom edge; horizontal
  // padding is untouched.
  card: {
    maxWidth: "1040px",
    mx: "auto",
    borderRadius: "20px",
    border: "1px solid",
    borderColor: "divider",
    boxShadow: "0 4px 32px rgba(26, 18, 8, 0.05), 0 1px 6px rgba(26, 18, 8, 0.03)",
    bgcolor: "background.paper",
    px: { xs: 2, md: 3 },
    py: { xs: 2.5, md: 3.5 },
  },

  title: {
    mb: { xs: 1.5, md: 2 },
    fontWeight: 700,
    color: "text.primary",
  },

  // Outer layout container.
  // flex row-reverse (not the previous float/flow-root) — floated elements
  // always align to the top and can't be centered, which is what this
  // conversion is for. row-reverse keeps the existing DOM order (image
  // first, text second) while still placing the image physically on the
  // left in RTL: default row would put the first DOM child at
  // flex-start (=inline-start=right), so row-reverse is required to keep
  // image-left/text-right unchanged. Mobile keeps the previous stacked
  // (image above text) arrangement, and is never row-reverse.
  //
  // No alignItems here deliberately — only the image should center (see
  // imageWrapper's alignSelf below). Centering at the container level
  // would center every flex item equally, including textColumn, which
  // would make short bodies of text float mid-row instead of starting at
  // the top like normal body text.
  imageAndTextArea: {
    display: "flex" as const,
    flexDirection: { xs: "column", md: "row-reverse" } as const,
  },

  // Desktop: 198px wide × 4/5 aspect ≈ 247.5px tall — 10% smaller than the
  // original 220px/275px so the image no longer dominates the card's inner
  // height now that it's vertically centered. Aspect ratio (4/5) is
  // unchanged, so shrinking width alone shrinks height by the same
  // proportion. Mobile is untouched (full-width landscape crop, 4/3).
  // marginInlineStart is a logical value — in RTL resolves to physical
  // margin-right, i.e. the gap between the image (physically on the left)
  // and the text column (physically on the right).
  //
  // alignSelf centers only this item against the row's height — the
  // targeted fix for the original "image sits too low" issue, without
  // affecting textColumn's own top-aligned flow. flexShrink:0 (unchanged
  // from before) keeps its width fixed rather than shrinking to fit.
  imageWrapper: {
    display: "block" as const,
    position: "relative" as const,
    width: { xs: "100%", md: "198px" },
    aspectRatio: { xs: "4/3", md: "4/5" },
    marginInlineStart: { xs: 0, md: "20px" },
    mb: { xs: 2, md: 0 },
    borderRadius: "12px",
    border: "1px solid",
    borderColor: "divider",
    overflow: "hidden" as const,
    flexShrink: 0,
    alignSelf: { xs: "stretch", md: "center" } as const,
  },

  // Text column beside the image. flex:1 so it grows to fill the
  // remaining width (previously automatic via BFC-beside-float; a flex
  // item needs this explicit now). minWidth:0 lets long unbroken text
  // wrap instead of forcing the flex item wider than the row. No
  // alignSelf override — default (stretch) keeps its content top-aligned,
  // it never centers as a block regardless of how short it is.
  //
  // Two separate selectors rather than one "& > * + *" rule: paragraphs
  // (Typography body1, rendered as <p>) get the tighter inter-paragraph
  // gap; the CTA link (rendered as <a>, always last) gets its own larger
  // gap so it reads as a distinct closing element rather than sitting
  // right under the last line of body text.
  textColumn: {
    flex: "1 1 0%",
    minWidth: 0,
    "& > p + p": { mt: 1.5 },
    "& > a": { mt: { xs: 2, md: 2.5 } },
  },

  // Individual preview paragraph — content-driven height, no clipping.
  previewParagraph: {
    lineHeight: 1.85,
    color: "text.primary",
  },

  // Calm editorial link, not a button — no background, no border, no pill
  // shape, and no underline (underline="none" prop on the Link itself
  // overrides the theme's global underline="hover" default — a standard
  // hyperlink underline read as too web-link-like for a "continuation of
  // the story" CTA). color:text.secondary (not text.primary, and not the
  // default link/accent color) — text.primary read too close to pure black
  // for a secondary CTA at rest; text.secondary is the same warm-brown
  // family, just restrained. Text and arrow share this color via
  // currentColor (no separate color on the arrow). gap:1 (8px) keeps the
  // phrase and arrow as two visually distinct elements rather than one
  // cramped string. Picked up by the textColumn "& > a" rule above for
  // spacing.
  //
  // On hover/focus: color steps one shade darker (text.secondary →
  // text.primary, the same warm-brown family) instead of underlining —
  // a quieter way to signal interactivity. Only the arrow glyph
  // (.about-arrow) translates, not the whole phrase — the text itself
  // stays visually still. :focus-visible gets the same treatment as
  // :hover for keyboard users.
  //
  // translateX is authored as a POSITIVE value here even though the arrow
  // needs to move screen-left (away from the text, in its pointing
  // direction): stylis-plugin-rtl flips the sign of translateX under the
  // page's dir="rtl", the same class of gotcha as the arrow glyph itself
  // needing to be picked manually rather than relying on dir to mirror it.
  // Verified empirically via getBoundingClientRect — a positive value here
  // renders as a negative (leftward) screen shift.
  readMoreLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: 1,
    color: "text.secondary",
    fontWeight: 600,
    transition: "color 0.15s ease",
    "&:hover, &:focus-visible": {
      color: "text.primary",
    },
    "&:hover .about-arrow, &:focus-visible .about-arrow": {
      transform: "translateX(5px)",
    },
  },

  // Kept as its own element (aria-hidden, see usage) so screen readers
  // announce only "קרא עוד", not the arrow glyph.
  readMoreArrow: {
    display: "inline-block",
    transition: "transform 0.2s ease",
  },
} as const;
