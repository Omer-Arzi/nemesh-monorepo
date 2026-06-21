"use client";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { lightTheme, darkTheme } from "@/lib/theme";
import { useUiStore } from "@/stores/uiStore";

/**
 * MUI ThemeProvider + CssBaseline wrapper.
 *
 * Reads `colorMode` from the global UI store so the theme responds to the
 * user's preference without prop-drilling through the component tree.
 *
 * Hydration note: `uiStore` initialises to "light", matching the server render,
 * so there is no hydration mismatch on first load. If color mode persistence is
 * added later (e.g. localStorage), use a mounted guard to avoid mismatches.
 */
export default function MuiProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const colorMode = useUiStore((s) => s.colorMode);
  const theme = colorMode === "dark" ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
