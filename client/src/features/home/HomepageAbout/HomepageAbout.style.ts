export const HomepageAboutStyle = {
  // Section band — matches LatestRecipes white treatment for visual continuity.
  section: {
    py: { xs: 4, sm: 5, md: 6 },
    bgcolor: "background.paper",
  },

  // Single editorial card: restrained radius, warm border, broad soft shadow.
  // Not a MUI Card — a plain Box so we avoid the heavy Material card aesthetic.
  card: {
    borderRadius: "24px",
    border: "1px solid",
    borderColor: "divider",
    boxShadow: "0 4px 40px rgba(26, 18, 8, 0.06), 0 1px 8px rgba(26, 18, 8, 0.03)",
    bgcolor: "background.paper",
    p: { xs: 2.5, md: 4 },
  },

  title: {
    mb: { xs: 2, md: 2.5 },
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

  // Floated image wrapper.
  // float: inline-end is a logical CSS value; in RTL context (dir="rtl" on
  // <html>) it resolves to physical left — placing the image on the left with
  // text wrapping to its right.  stylis-plugin-rtl does not flip logical values,
  // so this is safe with the project's RTL setup.
  imageWrapper: {
    display: "block" as const,
    position: "relative" as const,
    width: { xs: "100%", md: "40%" },
    aspectRatio: "4/5",
    float: { xs: "none", md: "inline-end" },
    // marginInlineStart in RTL = physical margin-right = gap between image and text.
    marginInlineStart: { xs: 0, md: "24px" },
    mb: { xs: 2, md: 0 },
    borderRadius: "16px",
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
    height: 88,
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
    mt: 2,
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
