import { alpha } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import { HEADER } from "@/components/layout/Header/styles/HeaderStyle";

export const HomeStickyHeaderStyle = {
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
    // Appearance transition — opacity + slight upward slide
    opacity: visible ? 1 : 0,
    visibility: visible ? "visible" : "hidden",
    transform: visible ? "translateY(0)" : "translateY(-6px)",
    transition:
      "opacity 180ms ease-out, transform 180ms ease-out, visibility 0ms linear 180ms",
    ...(visible && {
      transition: "opacity 180ms ease-out, transform 180ms ease-out",
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
    position: "relative" as const,
  },

  searchField: (theme: Theme) => ({
    "& .MuiOutlinedInput-root": {
      borderRadius: "100px",
      bgcolor: "background.default",
      boxShadow: `0 1px 4px ${alpha(theme.palette.common.black, 0.06)}`,
      pl: 1.5,
      pr: 1,
      "& fieldset": { border: "none" },
      "&:hover fieldset": { border: "none" },
      "&.Mui-focused fieldset": {
        border: "1px solid",
        borderColor: "primary.main",
      },
    },
    "& .MuiOutlinedInput-input": {
      py: 1,
    },
  }),
} as const;
