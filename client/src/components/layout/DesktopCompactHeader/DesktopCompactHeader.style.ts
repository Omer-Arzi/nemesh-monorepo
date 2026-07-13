import { alpha } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import { HEADER } from "../Header/styles/HeaderStyle";

const D = HEADER.COMPACT_TRANSITION_DURATION;
const E = HEADER.COMPACT_TRANSITION_EASING;

export const DesktopCompactHeaderStyle = {
  root: (visible: boolean) => ({
    display: { xs: "none", md: "flex" },
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: HEADER.DESKTOP_COMPACT_HEIGHT,
    bgcolor: "background.paper",
    borderBottom: "1px solid",
    borderColor: "divider",
    boxShadow: `0 1px 8px ${alpha("#000", 0.07)}`,
    zIndex: 1100,
    alignItems: "center",
    px: 3,
    gap: 2,
    opacity: visible ? 1 : 0,
    visibility: visible ? "visible" : "hidden",
    transform: visible ? "translateY(0)" : "translateY(-6px)",
    // Exit: opacity+transform animate, then visibility snaps to hidden after D ms.
    // Enter: visibility snaps to visible immediately, opacity+transform animate.
    transition: `opacity ${D}ms ${E}, transform ${D}ms ${E}, visibility 0ms linear ${D}ms`,
    ...(visible && {
      transition: `opacity ${D}ms ${E}, transform ${D}ms ${E}`,
    }),
    "@media (prefers-reduced-motion: reduce)": { transition: "none" },
  }),

  logoLink: {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
    textDecoration: "none",
    borderRadius: 1,
    "&:focus-visible": {
      outline: "2px solid",
      outlineColor: "primary.main",
      outlineOffset: "4px",
    },
  },

  logo: {
    display: "block",
    height: 34,
    width: "auto",
  },

  searchArea: {
    flex: 1,
    minWidth: 0,
    // Cap width on wider viewports so the header doesn't feel overfilled.
    maxWidth: { lg: 720 },
    position: "relative" as const,
  },

  searchField: (theme: Theme) => ({
    "& .MuiOutlinedInput-root": {
      borderRadius: "100px",
      bgcolor: "background.default",
      boxShadow: `0 1px 4px ${alpha(theme.palette.common.black, 0.06)}`,
      pl: 1.5,
      pr: 1,
      "& fieldset": { border: `1px solid ${theme.palette.divider}` },
      "&:hover fieldset": {
        border: `1px solid ${alpha(theme.palette.text.secondary, 0.45)}`,
      },
      "&.Mui-focused fieldset": {
        border: `2px solid ${theme.palette.primary.main}`,
      },
    },
    "& .MuiOutlinedInput-input": {
      py: 1,
    },
  }),
} as const;
