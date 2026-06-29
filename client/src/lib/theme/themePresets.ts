import { createTheme } from "@mui/material/styles";
import { lightPalette, darkPalette } from "./palette";
import { freckleWarmLightPalette, freckleWarmDarkPalette } from "./presets/freckleWarmPalette";
import { components } from "./components";
import { typography } from "./typography";
import { shadows } from "./shadows";

// ── Preset key type ────────────────────────────────────────────────────────────

export type ThemePresetKey = "classic" | "freckleWarm";

const VALID_PRESET_KEYS: readonly ThemePresetKey[] = ["classic", "freckleWarm"];

export function isValidPresetKey(value: unknown): value is ThemePresetKey {
  return typeof value === "string" && (VALID_PRESET_KEYS as readonly string[]).includes(value);
}

// ── Shared base config ─────────────────────────────────────────────────────────
// Everything except palette is shared across all presets.

const baseConfig = {
  direction: "rtl" as const,
  typography,
  components,
  shadows,
  shape: { borderRadius: 4 },
} as const;

// ── Light mode presets ─────────────────────────────────────────────────────────

export const lightThemePresets = {
  "classic": createTheme({ ...baseConfig, palette: lightPalette }),
  "freckleWarm": createTheme({ ...baseConfig, palette: freckleWarmLightPalette }),
} satisfies Record<ThemePresetKey, ReturnType<typeof createTheme>>;

// ── Dark mode presets ──────────────────────────────────────────────────────────

export const darkThemePresets = {
  "classic": createTheme({ ...baseConfig, palette: darkPalette }),
  "freckleWarm": createTheme({ ...baseConfig, palette: freckleWarmDarkPalette }),
} satisfies Record<ThemePresetKey, ReturnType<typeof createTheme>>;
