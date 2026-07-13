import { alpha } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import { HEADER } from "../Header/styles/HeaderStyle";

export const RAIL_WIDTH = 240;
export const RAIL_COLLAPSED_WIDTH = 64;
// Sidebar sticks at the compact header height: when this threshold is crossed,
// the AppBar has already animated to its compact size, so they stay flush.
export const APP_HEADER_HEIGHT = HEADER.DESKTOP_COMPACT_HEIGHT;

const TOGGLE_SIZE = 28;

export const NavigationRailStyle = {
  // Sticky positioning shell: width animates, stays on screen while page scrolls.
  // Sits in a RTL flex row → naturally lands on the physical right side.
  // overflow:visible lets the toggle button poke out over the content.
  outer: (open: boolean, stickyTop: number = APP_HEADER_HEIGHT) => ({
    // Hidden on mobile — Header's hamburger + NavDrawer handle mobile navigation.
    display: { xs: "none", md: "block" },
    position: "sticky",
    top: stickyTop,
    height: `calc(100vh - ${stickyTop}px)`,
    alignSelf: "flex-start",
    flexShrink: 0,
    width: open ? RAIL_WIDTH : RAIL_COLLAPSED_WIDTH,
    overflow: "visible",
    // top/height transition is synchronized with DesktopCompactHeader's enter/exit
    // so sidebar and header move together as a unit.
    transition: [
      "width 300ms cubic-bezier(0.4, 0, 0.2, 1)",
      `top ${HEADER.COMPACT_TRANSITION_DURATION}ms ${HEADER.COMPACT_TRANSITION_EASING}`,
      `height ${HEADER.COMPACT_TRANSITION_DURATION}ms ${HEADER.COMPACT_TRANSITION_EASING}`,
    ].join(", "),
    "@media (prefers-reduced-motion: reduce)": {
      transition: "width 300ms cubic-bezier(0.4, 0, 0.2, 1)",
    },
    // Without zIndex the main content (later in DOM) stacks on top, hiding the toggle button
    zIndex: 10,
  }),

  // Visual surface: clips the content, provides background / border / shadow.
  // All directional properties use CSS logical equivalents so stylis-plugin-rtl
  // does not flip them — the browser resolves them correctly for RTL.
  panel: (theme: Theme) => ({
    width: "100%",
    height: "100%",
    overflow: "hidden",
    bgcolor: "background.paper",
    // borderInlineEnd = physical left in RTL (the content-facing edge)
    borderInlineEnd: `1px solid ${theme.palette.divider}`,
    // Rounded corners only on the content-facing (physical left) side
    borderStartEndRadius: "8px",
    borderEndEndRadius:   "8px",
    borderStartStartRadius: 0,
    borderEndStartRadius:   0,
    // Write +8px so stylis-plugin-rtl flips it to -8px → shadow goes left (toward content)
    boxShadow: `8px 0 28px ${alpha(theme.palette.text.primary, 0.05)}`,
  }),

  // Nav content: always RAIL_WIDTH wide.
  // The panel's overflow:hidden clips the left portion as the panel shrinks,
  // leaving the right portion (icons, in RTL) visible.
  navContent: {
    width: RAIL_WIDTH,
    display: "flex",
    flexDirection: "column" as const,
    pt: 2.5,
    pb: 6,
    minHeight: "100%",
  },

  nav: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 0.25,
    px: 1,
    pt: 1.5,
    flex: 1,
  },

  // Toggle button: centered on the panel's content-facing edge.
  // `insetInlineEnd` = physical left in RTL, not flipped by stylis-plugin-rtl.
  // -TOGGLE_SIZE/2 straddles the outer's left edge (half inside, half outside).
  // No separate left-position animation needed: the button is always anchored
  // to the outer's inline-end edge, which moves as the outer width animates.
  toggle: {
    position: "absolute" as const,
    insetInlineEnd: -(TOGGLE_SIZE / 2),
    top: "80%",
    transform: "translateY(-50%)",
    zIndex: 1,
    width: TOGGLE_SIZE,
    height: TOGGLE_SIZE,
    minWidth: "unset",
    borderRadius: "50%",
    bgcolor: "background.paper",
    border: "1px solid",
    borderColor: "divider",
    boxShadow: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    p: 0,
    "&:hover": {
      bgcolor: "background.paper",
      boxShadow: 4,
    },
    "& .MuiSvgIcon-root": {
      fontSize: "0.875rem",
      color: "text.secondary",
    },
  },
};
