import type { Theme } from "@mui/material/styles";

// Roughly the handle's own footprint — lets MUI's built-in edge-swipe
// detection activate specifically over the visible handle, so dragging from
// it "naturally" opens the drawer without any hand-rolled pointer code.
const SWIPE_AREA_WIDTH = 56;

// Starting point only — deliberately not treated as final. Tune by eye
// against the running drawer at a few portrait tablet widths before calling
// this done (see docs/tablet-experience-todo.md).
const springEasing = {
  enter: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  exit: "cubic-bezier(0.4, 0, 0.2, 1)",
};

export const TabletIngredientsDrawerStyle = {
  SWIPE_AREA_WIDTH,
  springEasing,

  // The entire "collapsed" affordance. Deliberately reads as a drawer handle
  // attached to the screen edge, not a floating action button:
  //  - flush to the physical right edge (no gap, no margin), only the
  //    content-facing (left) corners are rounded — the edge-touching (right)
  //    corners stay square.
  //  - shadow only falls toward the content side, never a symmetric
  //    all-around drop shadow, so it doesn't read as floating.
  //  - zIndex above the drawer paper so it stays visible as a tab the panel
  //    slides out from behind, in both the open and closed state.
  //
  //  NOTE — RTL gotcha (see client/CLAUDE.md): stylis-plugin-rtl auto-flips
  //  physical left/right-family CSS properties written via `sx`. Authoring
  //  `right: 0` here renders at the visual LEFT edge instead (confirmed via
  //  screenshot, not assumed) — so position, border-radius corner order, and
  //  the shadow's x-offset are all authored "pre-flipped" (as if for the
  //  visual left) so the flip lands them at the intended physical right.
  handle: (theme: Theme) => ({
    position: "fixed" as const,
    left: 0,
    top: "45%",
    transform: "translateY(-50%)",
    zIndex: theme.zIndex.drawer + 1,
    width: 56,
    minHeight: 96,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: 0.5,
    py: 1.5,
    bgcolor: "background.paper",
    border: "1px solid",
    borderColor: "divider",
    borderRadius: "0 14px 14px 0",
    boxShadow: "3px 2px 12px rgba(38, 23, 15, 0.12)",
    cursor: "pointer",
    userSelect: "none" as const,
    "&:active": {
      bgcolor: "action.selected",
    },
  }),

  handleIcon: {
    color: "text.secondary",
    fontSize: "1.4rem",
  },

  handleLabel: {
    fontSize: "0.72rem",
    fontWeight: 600,
    color: "text.secondary",
    lineHeight: 1.2,
  },

  // Width intentionally not locked to the desktop sidebar's 300px — this is
  // a starting point to tune visually across ~600/768/834/900px so the
  // panel feels proportional rather than borrowing a desktop value verbatim.
  paper: {
    width: "clamp(280px, 42vw, 360px)",
    display: "flex",
    flexDirection: "column" as const,
  },

  header: {
    px: 3,
    py: 2,
    borderBottom: 1,
    borderColor: "divider",
    flexShrink: 0,
  },

  headerTitle: {
    fontWeight: 700,
    fontSize: "1.1rem",
  },

  count: {
    fontWeight: "normal",
    color: "text.secondary",
  },

  content: {
    flex: 1,
    overflowY: "auto" as const,
    px: 3,
    pt: 2,
    pb: 3,
  },
} as const;
