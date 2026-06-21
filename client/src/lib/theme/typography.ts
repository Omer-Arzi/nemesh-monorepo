import type { ThemeOptions } from "@mui/material/styles";

/**
 * Typography scale.
 *
 * Why here: font choices and scale ratios are brand decisions that should live
 * separate from palette so a designer can swap one without touching the other.
 *
 * What belongs here: fontFamily, fontSize, fontWeight, lineHeight, and
 * variant overrides (h1–h6, body1/2, caption, overline, etc.).
 *
 * What does NOT belong here: colour — font colours are part of the palette.
 *
 * TODO: Replace the fontFamily placeholder once the type system is confirmed.
 * TODO: Adjust scale ratios once a design spec exists.
 */
export const typography: NonNullable<ThemeOptions["typography"]> = {
  fontFamily: [
    "var(--font-heebo)",
    "Heebo",
    "Arial",
    "sans-serif",
  ].join(","),

  // Base size — MUI default is 14px; 16px aligns with browser default.
  // TODO: confirm with design
  fontSize: 16,

  // Weight hierarchy: 800 for hero titles, 700 for major headings,
  // 600 for section headers, 400 for body.
  h1: { fontWeight: 800 },
  h2: { fontWeight: 700 },
  h3: { fontWeight: 700 },
  h4: { fontWeight: 600 },
  h5: { fontWeight: 600 },
  h6: { fontWeight: 500 },

  body1: { lineHeight: 1.6 },
  body2: { lineHeight: 1.5 },
};
