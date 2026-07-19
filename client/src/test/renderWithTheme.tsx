import { render, type RenderOptions } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { lightTheme } from "@/lib/theme";

/**
 * Renders with the real Nemesh theme instead of MUI's stock default.
 * Required whenever an assertion depends on theme-driven values (variant
 * fontWeight, palette tokens, etc.) rather than only explicit sx overrides —
 * MUI silently falls back to its own default theme without a ThemeProvider,
 * which passes tests for the wrong reason.
 */
export function renderWithTheme(ui: React.ReactElement, options?: RenderOptions) {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>, options);
}
