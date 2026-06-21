import type { Components, Theme } from "@mui/material/styles";

/**
 * Global MUI component default overrides.
 *
 * Why here: component-level style decisions (default props, style overrides)
 * belong in one file so they are easy to audit and override without touching
 * per-component files.
 *
 * What belongs here: `defaultProps` and `styleOverrides` for MUI components
 * that need project-wide defaults different from MUI's own defaults.
 *
 * What does NOT belong here: one-off overrides for a single screen — those
 * belong in the component's own `sx` prop or styled() call.
 *
 * TODO: Populate as component decisions are made during feature development.
 */
export const components: Components<Theme> = {
  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      root: {
        textTransform: "none", // avoid all-caps default
        borderRadius: 10,       // slightly less than cards (12px) for visual hierarchy
      },
    },
  },

  MuiTextField: {
    defaultProps: {
      variant: "outlined",
      size: "small",
      fullWidth: true,
    },
  },

  MuiCard: {
    defaultProps: {
      elevation: 0,
      variant: "outlined",
    },
  },

  MuiLink: {
    defaultProps: {
      underline: "hover",
    },
  },
};
