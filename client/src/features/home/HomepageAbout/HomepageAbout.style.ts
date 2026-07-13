export const HomepageAboutStyle = {
  // Section band — compact vertical rhythm; this is a secondary homepage element.
  section: {
    py: { xs: 3, sm: 3.5, md: 4 },
    bgcolor: "background.paper",
  },

  // Editorial card: constrained max width so it reads as a focused inset
  // rather than a full-width content band. Centred within the PageContainer.
  // No overflow restriction — the card must never clip its own border or shadow.
  card: {
    maxWidth: "1040px",
    mx: "auto",
    borderRadius: "20px",
    border: "1px solid",
    borderColor: "divider",
    boxShadow: "0 4px 32px rgba(26, 18, 8, 0.05), 0 1px 6px rgba(26, 18, 8, 0.03)",
    bgcolor: "background.paper",
    p: { xs: 2, md: 3 },
  },

  title: {
    mb: { xs: 1.5, md: 2 },
    fontWeight: 700,
    color: "text.primary",
  },

  // Outer layout container.
  // display:flow-root creates a BFC: it contains the floated imageWrapper so the
  // card grows to encompass the full image height automatically, without an
  // explicit clearfix.  No overflow restriction — never clips image or border.
  imageAndTextArea: {
    display: "flow-root" as const,
  },

  // Floated image wrapper — fixed width on desktop, outside the text-clip boundary.
  // float: inline-end is a logical CSS value; in RTL context (dir="rtl" on <html>)
  // it resolves to physical left.  stylis-plugin-rtl does not flip logical values.
  // The image is a sibling of textClipper, never inside it — it is never clipped.
  imageWrapper: {
    display: "block" as const,
    position: "relative" as const,
    // Fixed 280px on desktop keeps the card compact. 4:5 ratio → 280×350px.
    // On mobile: full-width, stacked above the text.
    width: { xs: "100%", md: "280px" },
    aspectRatio: "4/5",
    float: { xs: "none", md: "inline-end" },
    // marginInlineStart in RTL = physical margin-right = gap between image and text.
    marginInlineStart: { xs: 0, md: "20px" },
    mb: { xs: 2, md: 0 },
    borderRadius: "12px",
    border: "1px solid",
    borderColor: "divider",
    overflow: "hidden" as const,
    flexShrink: 0,
  },

  // Text-only clipping container.
  // overflow:hidden establishes a BFC. As a BFC block beside the float it sits
  // to the physical right of imageWrapper (text start in RTL) without overlapping.
  // Only text content is clipped — the image is a sibling, not a child.
  //
  // height is set dynamically from measured text scrollHeight:
  //   collapsed → image height + controls row height
  //   expanded  → full text scrollHeight
  //
  // CSS mask-image is applied inline when collapsed+overflow. The gradient is
  // expressed in percentages of this element, so it always sits at the current
  // visible bottom regardless of where the height animation is mid-flight.
  textClipper: {
    overflow: "hidden" as const,
    // Height transition animates text expansion/collapse.
    // CSS cannot animate auto→px so the initial snap (pre-measurement) is instant.
    transition: "height 320ms ease-in-out",
    "@media (prefers-reduced-motion: reduce)": {
      transition: "none",
    },
  },

  // Centred row that holds the expand/collapse button.
  // Outside imageAndTextArea — always fully visible, never clipped.
  // mt: 0.5 (4px) — the collapsed textClipper height already reserves space for
  // this row, so only a minimal gap is needed to separate it from the fade.
  expandControls: {
    display: "flex",
    justifyContent: "center",
    mt: 0.5,
  },

  // Semantic <button> styled to feel like a branded text link with a pill hover.
  expandButton: {
    display: "flex",
    alignItems: "center",
    gap: 0.5,
    bgcolor: "transparent",
    border: "none",
    cursor: "pointer",
    color: "primary.main",
    fontFamily: "inherit",
    fontSize: "0.875rem",
    fontWeight: 600,
    lineHeight: 1.5,
    p: "6px 14px",
    borderRadius: "20px",
    "&:hover": {
      bgcolor: "action.hover",
    },
    "&:focus-visible": {
      outline: "2px solid",
      outlineColor: "primary.main",
      outlineOffset: "2px",
    },
  },

  // Chevron icon — rotation applied dynamically from state.
  expandIcon: {
    fontSize: "1.125rem",
    transition: "transform 280ms ease-in-out",
    "@media (prefers-reduced-motion: reduce)": {
      transition: "none",
    },
  },
} as const;
