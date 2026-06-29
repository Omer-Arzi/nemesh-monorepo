import { alpha } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";

export const NavigationItemStyle = {
  // CSS resets for when the item renders as a <button> element
  buttonReset: {
    appearance: "none" as const,
    background: "none",
    border: "none",
    margin: 0,
    fontFamily: "inherit",
    textAlign: "inherit" as const,
  },

  loadingState: {
    opacity: 0.65,
    pointerEvents: "none" as const,
    cursor: "wait" as const,
  },

  root: (active: boolean) => ({
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    px: 1,
    py: 1.25,
    width: "100%",
    borderRadius: 2,
    textDecoration: "none",
    transition: "background-color 200ms ease, color 200ms ease",
    cursor: "pointer",
    ...(active
      ? {
          color: "primary.dark",
          bgcolor: (theme: Theme) => alpha(theme.palette.primary.main, 0.09),
          "&:hover": {
            bgcolor: (theme: Theme) => alpha(theme.palette.primary.main, 0.14),
          },
        }
      : {
          color: "text.secondary",
          "&:hover": {
            bgcolor: "action.hover",
            color: "text.primary",
          },
        }),
  }),

  icon: (active: boolean) => ({
    fontSize: "1.25rem",
    flexShrink: 0,
    color: active ? "primary.dark" : "inherit",
    transition: "color 200ms ease",
  }),

  // `railOpen` controls opacity only — layout stays the same so the icon
  // stays anchored to the RTL-start (physical right) side at all widths.
  label: (active: boolean, railOpen: boolean) => ({
    fontWeight: active ? 600 : 500,
    fontSize: "0.875rem",
    lineHeight: 1.4,
    color: active ? "primary.dark" : "inherit",
    opacity: railOpen ? 1 : 0,
    transition: "opacity 200ms ease, color 200ms ease",
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
    flex: 1,
    minWidth: 0,
  }),
};
