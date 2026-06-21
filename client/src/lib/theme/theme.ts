import { createTheme } from "@mui/material/styles";
import { components } from "./components";
import { lightPalette, darkPalette } from "./palette";
import { shadows } from "./shadows";
import { typography } from "./typography";

/**
 * Assembles the MUI theme from its constituent parts.
 *
 * Export individual theme objects (not a factory) because Next.js server
 * components cannot hold closures created at request time — the theme is a
 * static singleton consumed by the client-side ThemeProvider.
 */

export const lightTheme = createTheme({
  direction: "rtl",
  palette: lightPalette,
  typography,
  components,
  shadows,
  shape: {
    // Base unit: 4px. Components use the multiplier (e.g. borderRadius: 3 = 12px).
    // Target range is 12–16px per the Nemesh design system.
    borderRadius: 4,
  },
});

export const darkTheme = createTheme({
  direction: "rtl",
  palette: darkPalette,
  typography,
  components,
  shape: {
    borderRadius: 8,
  },
});

// Default export is the light theme; ThemeProvider decides which to use.
export default lightTheme;
