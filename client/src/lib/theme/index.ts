/**
 * Public surface of the theme module.
 * Import theme utilities from "@/lib/theme", not from deep paths.
 */
export { lightTheme, darkTheme } from "./theme";
export { lightPalette, darkPalette } from "./palette";
export { typography } from "./typography";
export { components } from "./components";
export { lightThemePresets, darkThemePresets, isValidPresetKey } from "./themePresets";
export type { ThemePresetKey } from "./themePresets";
