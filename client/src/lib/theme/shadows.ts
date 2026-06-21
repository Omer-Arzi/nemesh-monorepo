import type { Shadows } from "@mui/material/styles";

/**
 * Warm shadow scale for the Nemesh theme.
 *
 * All shadows use rgba(90, 45, 10, …) — a dark warm brown — instead of
 * MUI's default rgba(0, 0, 0, …). This eliminates the cool blue-grey cast
 * that default shadows produce on warm backgrounds.
 *
 * The scale is a single-layer progression: as elevation increases the shadow
 * grows in size and opacity. Level 6 is the one RecipeCard uses on hover.
 */

// Shadow color: dark warm brown at the given opacity.
const s = (blur: number, y: number, opacity: number): string =>
  `0 ${y}px ${blur}px 0 rgba(90, 45, 10, ${opacity})`;

// MUI requires exactly 25 shadow levels (indices 0–24).
// The `satisfies` keyword verifies the tuple shape at compile time.
// The explicit `: Shadows` annotation ensures the export type is `Shadows`,
// not a wider inferred array type. Both checks together are intentional.
export const shadows: Shadows = [
  "none",           // 0  — MUI requires the literal string "none" at index 0
  s(4,   1, 0.07), // 1
  s(6,   1, 0.08), // 2
  s(8,   2, 0.09), // 3
  s(10,  2, 0.10), // 4
  s(12,  3, 0.10), // 5
  s(14,  4, 0.11), // 6  ← RecipeCard hover (sx boxShadow: 6)
  s(16,  4, 0.11), // 7
  s(18,  5, 0.12), // 8
  s(20,  5, 0.12), // 9
  s(22,  6, 0.13), // 10
  s(24,  6, 0.13), // 11
  s(26,  7, 0.14), // 12
  s(28,  7, 0.14), // 13
  s(30,  8, 0.14), // 14
  s(32,  8, 0.15), // 15
  s(34,  9, 0.15), // 16
  s(36,  9, 0.16), // 17
  s(38, 10, 0.16), // 18
  s(40, 10, 0.17), // 19
  s(42, 11, 0.17), // 20
  s(44, 11, 0.18), // 21
  s(46, 12, 0.18), // 22
  s(48, 12, 0.19), // 23
  s(52, 14, 0.20), // 24
  // Total: 25 entries. TypeScript will error here if the count is wrong.
] satisfies Shadows;
