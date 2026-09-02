import { alpha } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";

export const SearchSuggestionsStyle = {
  root: (theme: Theme) => ({
    position: "absolute" as const,
    top: "calc(100% + 8px)",
    left: 0,
    right: 0,
    zIndex: 1300,
    borderRadius: 3,
    border: `1px solid ${theme.palette.divider}`,
    overflow: "hidden" as const,
    maxHeight: 320,
    overflowY: "auto" as const,
    bgcolor: "grey.100",
  }),

  row: (theme: Theme) => ({
    display: "flex",
    flexDirection: "column" as const,
    px: 2.5,
    py: 1.25,
    cursor: "pointer",
    userSelect: "none" as const,
    transition: "background-color 0.12s ease",
    "&:hover": {
      bgcolor: alpha(theme.palette.text.primary, 0.04),
    },
    "&:not(:last-child)": {
      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
    },
  }),

  rowActive: (theme: Theme) => ({
    bgcolor: alpha(theme.palette.primary.main, 0.08),
    "&:hover": {
      bgcolor: alpha(theme.palette.primary.main, 0.08),
    },
  }),

  // Recommended-mode single-line row: overrides the typed row's column layout
  // and adds an explicit touch target (a one-line row would not otherwise
  // clear 44px the way the two-line typed rows do incidentally).
  recommendedRow: {
    flexDirection: "row" as const,
    alignItems: "center",
    py: 1.5,
    minHeight: 44,
  },

  // Non-interactive section-label strip above the recommended rows.
  recommendedHeading: (theme: Theme) => ({
    px: 2.5,
    pt: 1.5,
    pb: 1,
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
  }),

  recommendedHeadingText: {
    fontSize: "0.72rem",
    fontWeight: 700,
    color: "text.secondary",
    letterSpacing: "0.03em",
    lineHeight: 1.3,
  },

  label: {
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "text.primary",
    lineHeight: 1.4,
  },

  subtitle: {
    fontSize: "0.72rem",
    color: "text.disabled",
    lineHeight: 1.3,
    mt: 0.2,
  },
} as const;
