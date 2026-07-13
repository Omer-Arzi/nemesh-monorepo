export const HomepageAboutStyle = {
  // Section band — compact vertical rhythm; this is a secondary homepage element.
  section: {
    py: { xs: 3, sm: 3.5, md: 4 },
    bgcolor: "background.paper",
  },

  // Editorial card: constrained max width so it reads as a focused inset
  // rather than a full-width content band. Centred within the PageContainer.
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

  // Relative anchor for the absolute-positioned fade overlay.
  contentOuter: {
    position: "relative" as const,
  },

  // Clipping container. overflow:hidden establishes a BFC, which both clips
  // content to the measured height AND contains the floated image so it is
  // included in scrollHeight without a separate clearfix.
  contentInner: {
    overflow: "hidden" as const,
    // Height is set dynamically from measured values; transition animates the
    // collapse/expand. CSS cannot animate auto → px, so the initial snap from
    // "auto" (SSR) to the measured collapsed height is instant by design.
    transition: "height 320ms ease-in-out",
    "@media (prefers-reduced-motion: reduce)": {
      transition: "none",
    },
  },

  // Floated image wrapper — fixed width on desktop keeps the card compact.
  // float: inline-end is a logical CSS value; in RTL context (dir="rtl" on
  // <html>) it resolves to physical left — placing the image on the left with
  // text wrapping to its right.  stylis-plugin-rtl does not flip logical values,
  // so this is safe with the project's RTL setup.
  imageWrapper: {
    display: "block" as const,
    position: "relative" as const,
    // Fixed 280px on desktop — stays compact and predictable regardless of card width.
    // 4:5 ratio makes this 280×350px; collapsed height ≈ 350px on desktop.
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

  // Gradient fade at the bottom of the clipping container — visible only when
  // content is truncated. The gradient colour is injected in the component from
  // theme.palette.background.paper so it fades into the actual card background.
  fade: {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    pointerEvents: "none" as const,
    zIndex: 1,
    transition: "opacity 280ms ease",
    "@media (prefers-reduced-motion: reduce)": {
      transition: "none",
    },
  },

  // Centred row that holds the expand/collapse button.
  expandControls: {
    display: "flex",
    justifyContent: "center",
    mt: 1.5,
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

  // Chevron icon — rotation is applied dynamically from state.
  expandIcon: {
    fontSize: "1.125rem",
    transition: "transform 280ms ease-in-out",
    "@media (prefers-reduced-motion: reduce)": {
      transition: "none",
    },
  },
} as const;
