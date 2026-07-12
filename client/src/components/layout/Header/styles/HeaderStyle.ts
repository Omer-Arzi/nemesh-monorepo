// ─── Dimension constants ───────────────────────────────────────────────────────

export const HEADER = {
  // Desktop AppBar heights (px)
  DESKTOP_HEIGHT: 96,
  DESKTOP_COMPACT_HEIGHT: 64,

  // Mobile AppBar height (px) — fixed, no scroll-shrinking on mobile
  MOBILE_HEIGHT: 64,

  // Desktop logo heights (px)
  DESKTOP_LOGO_HEIGHT: 78,         // initial
  DESKTOP_COMPACT_LOGO_HEIGHT: 50, // after scroll threshold

  // Mobile logo height (px) — used with placeholder until logo-mobile.svg exists
  MOBILE_LOGO_HEIGHT: 36,

  // px of scrollY before compact state activates (desktop only)
  SCROLL_THRESHOLD: 32,

  // Transition duration in ms — shared by AppBar and logo
  TRANSITION_DURATION: 250,
} as const;

// ─── Motion helpers ────────────────────────────────────────────────────────────

const APPBAR_MOTION = {
  transition: `height ${HEADER.TRANSITION_DURATION}ms ease-out, box-shadow ${HEADER.TRANSITION_DURATION}ms ease-out`,
  "@media (prefers-reduced-motion: reduce)": { transition: "none" },
} as const;

const LOGO_MOTION = {
  transition: `height ${HEADER.TRANSITION_DURATION}ms ease-out`,
  "@media (prefers-reduced-motion: reduce)": { transition: "none" },
} as const;

// ─── Style object ──────────────────────────────────────────────────────────────

export const HeaderStyle = {
  /** AppBar root — height animates on desktop only. Mobile is fixed. */
  appBar: (compact: boolean) => ({
    height: {
      xs: HEADER.MOBILE_HEIGHT,
      md: compact ? HEADER.DESKTOP_COMPACT_HEIGHT : HEADER.DESKTOP_HEIGHT,
    },
    borderBottom: compact ? 0 : 1,
    borderColor: "divider",
    boxShadow: compact
      ? "0 1px 6px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)"
      : "none",
    ...APPBAR_MOTION,
  }),

  /**
   * Toolbar — `position: relative` is required so the absolute logo center
   * layer is contained within the toolbar (and therefore within the AppBar).
   */
  toolbar: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    height: "100%",
    minHeight: "0 !important",
    px: { xs: 1.5, md: 3 },
  },

  /**
   * Start side (physical right in RTL): hamburger trigger on mobile.
   * position:relative + zIndex:1 keeps side controls above the absolute
   * logo layer so their click areas remain fully accessible.
   */
  sideStart: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    position: "relative",
    zIndex: 1,
  },

  /** End side (physical left in RTL): mobile logo on mobile, empty on desktop. */
  sideEnd: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative",
    zIndex: 1,
  },

  /**
   * Absolute-centered logo container — desktop only.
   *
   * left:0 + right:0 + justify-content:center anchors the logo at exactly
   * 50% of the AppBar width, which equals 50% of the viewport.
   * This is immune to asymmetric side controls and to the NavigationRail's
   * open/closed state (the sidebar is a sibling of the header, not a parent).
   *
   * pointer-events:none passes clicks through to side controls underneath.
   * The logo <Link> inside restores pointer-events:auto for its own area.
   */
  logoCenter: {
    display: { xs: "none", md: "flex" },
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },

  /** Desktop logo link — focus ring, pointer-events restored. */
  logoLink: {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
    textDecoration: "none",
    borderRadius: 1,
    pointerEvents: "auto",
    "&:focus-visible": {
      outline: "2px solid",
      outlineColor: "primary.main",
      outlineOffset: "4px",
    },
  },

  /** Desktop logo <img> — height animates, width auto-scales from aspect ratio. */
  logo: (compact: boolean) => ({
    display: "block",
    height: compact ? HEADER.DESKTOP_COMPACT_LOGO_HEIGHT : HEADER.DESKTOP_LOGO_HEIGHT,
    width: "auto",
    ...LOGO_MOTION,
  }),

  /**
   * Mobile logo link — visible on mobile only, in sideEnd (physical left in RTL).
   * Minimum 44px touch area provided by padding on the link box.
   */
  mobileLogoLink: {
    display: { xs: "flex", md: "none" },
    alignItems: "center",
    textDecoration: "none",
    borderRadius: 1,
    minHeight: 44,
    px: 0.5,
    "&:focus-visible": {
      outline: "2px solid",
      outlineColor: "primary.main",
      outlineOffset: "4px",
    },
  },

  /** Mobile logo <img> — fixed size, no animation. */
  mobileLogo: {
    display: "block",
    height: HEADER.MOBILE_LOGO_HEIGHT,
    width: "auto",
  },

  /**
   * Hamburger — mobile only.
   * MUI IconButton default padding is 8px; at 24px icon size the hit area
   * is 40px. Adding 2px extra padding brings it to 44px minimum.
   */
  hamburger: {
    display: { md: "none" },
    p: "10px",
  },
};
