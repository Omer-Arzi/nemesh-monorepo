import type { Theme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import { HEADER_HEIGHT } from "../../RecipeDetailLayout/styles/RecipeDetailLayoutStyle";

const FADE_HEIGHT = 48;

export const StickyIngredientsSidebarStyle = {
  outer: {
    height: "100%",
  },
  // Sticky positioning + maxHeight live here.
  // position: sticky creates a containing block for the absolute scrollFade child.
  stickyPanel: {
    position: { xs: "static", md: "sticky" } as const,
    top: { md: HEADER_HEIGHT },
  },
  // Scroll container: maxHeight + overflow live here so scrolling is bounded.
  // Padding also lives here (not on stickyPanel) so the absolute fade can
  // anchor to the true bottom edge of the panel rather than the padding edge.
  scrollArea: {
    overflowY: { md: "auto" } as const,
    maxHeight: { md: `calc(100vh - ${HEADER_HEIGHT}px)` },
    p: { xs: 2, md: 3 },
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    pb: 2,
    mb: 2,
    borderBottom: 1,
    borderColor: "divider",
    gap: 1,
    flexWrap: "wrap" as const,
  },
  headerTitle: {
    fontWeight: 600,
  },
  count: {
    fontWeight: "normal",
    color: "text.secondary",
    ms: 0.75,
  },

  // ── Mobile-only inline trigger card ────────────────────────────────────────
  mobileTrigger: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    px: 3,
    py: 2.5,
    m: 2,
    bgcolor: "background.paper",
    borderRadius: 3,
    border: "1px solid",
    borderColor: "divider",
    cursor: "pointer",
    userSelect: "none" as const,
    transition: "background-color 0.15s ease",
    "&:active": {
      bgcolor: "action.selected",
    },
  },
  mobileTriggerTitle: {
    fontWeight: 700,
    fontSize: "1rem",
    lineHeight: 1.3,
  },
  mobileTriggerHint: {
    fontSize: "0.8rem",
    color: "text.secondary",
    mt: 0.25,
  },
  mobileTriggerArrow: {
    color: "text.disabled",
    flexShrink: 0,
  },

  // ── Mobile sticky bottom bar ────────────────────────────────────────────────
  // Appears when the inline trigger has scrolled above the viewport.
  // position:fixed escapes the RecipeDetailLayout grid cell — sits at the true
  // bottom of the viewport regardless of where the component is mounted in the DOM.
  // display:{xs:"flex",md:"none"} hides it on desktop via CSS only, so the JS
  // visibility logic never needs to know about the current breakpoint.
  // opacity/transform/pointerEvents are driven by inline style (runtime values).
  // paddingBottom is set via inline style to allow env(safe-area-inset-bottom).
  stickyBar: {
    display: { xs: "flex", md: "none" },
    position: "fixed" as const,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "column" as const,
    alignItems: "stretch",
    bgcolor: "background.paper",
    // Matches the open bottom sheet's top corners so the bar reads as the
    // "collapsed" state of the same surface. No flat border — the upward
    // shadow provides separation just like the sheet's backdrop does.
    borderRadius: "20px 20px 0 0",
    boxShadow: "0 -4px 20px rgba(26, 18, 8, 0.12), 0 -1px 6px rgba(26, 18, 8, 0.07)",
    // zIndex: below MUI AppBar (1100) and Drawer modal (1300), above page content.
    zIndex: 1050,
    transition: "opacity 220ms ease, transform 220ms ease",
  },
  stickyBarInner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    px: 3,
    py: 1.5,
    cursor: "pointer",
    userSelect: "none" as const,
    transition: "background-color 0.15s ease",
    "&:active": {
      bgcolor: "action.selected",
    },
  },
  stickyBarTitle: {
    fontWeight: 700,
    fontSize: "0.95rem",
    lineHeight: 1.3,
  },
  stickyBarHint: {
    fontSize: "0.75rem",
    color: "text.secondary",
    mt: 0.2,
  },
  stickyBarIcon: {
    color: "text.secondary",
    flexShrink: 0,
    fontSize: "1.5rem",
  },

  // Absolutely positioned sibling of scrollArea — NOT inside the scroll container.
  // bottom: 0 anchors to stickyPanel's bottom edge (the true visible boundary).
  // Because it is outside the scroll area it is never clipped by overflow: auto.
  scrollFade: (theme: Theme) => ({
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: FADE_HEIGHT,
    background: `linear-gradient(to bottom,
      ${alpha(theme.palette.common.black, 0)} 0%,
      ${alpha(theme.palette.common.black, 0.08)} 25%,
      ${alpha(theme.palette.common.black, 0.22)} 50%,
      ${alpha(theme.palette.common.black, 0.42)} 75%,
      ${alpha(theme.palette.common.black, 0.58)} 100%)`,
    pointerEvents: "none" as const,
    zIndex: 2,
    display: { xs: "none", md: "block" },
  }),
};
