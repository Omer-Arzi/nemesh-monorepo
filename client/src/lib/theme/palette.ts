import type { PaletteOptions } from "@mui/material/styles";

/**
 * Nemesh "נוגה · Sunlit Kitchen" colour tokens — Direction 2.
 *
 * Semantic mapping:
 *   primary   → Toasted Crust (#C17B3C) — the dominant brand colour
 *   secondary → Warm Peach (#E8A96B)    — supporting warm amber
 *   warning   → Afternoon Gold (#F2C55A) — used as the accent / highlight colour
 *   error     → Burnt Sienna (#B84035)
 *   background.default → Candlelight White (#FFFCF7)
 *   background.paper   → Pure White (#FFFFFF)
 *   text.primary       → Dark Roast (#1A1208)
 *   text.secondary     → Warm Walnut (#6B5332)
 *   divider            → Warm Cream (#EDE4D5)
 */

export const lightPalette: PaletteOptions = {
  mode: "light",

  primary: {
    main: "#C17B3C",
    light: "#D4956A",
    dark: "#9A5E28",
    contrastText: "#FFFFFF",
  },

  secondary: {
    main: "#E8A96B",
    light: "#F0C48A",
    dark: "#C4844A",
    contrastText: "#1A1208",
  },

  // TODO: Nemesh's warm accent colour (Afternoon Gold, #F2C55A) is mapped to
  // the `warning` slot as a temporary measure. This keeps the palette type-safe
  // without requiring MUI palette module augmentation. When the design system
  // is formalised, evaluate whether to:
  //   (a) Keep it here and accept the semantic mismatch (simplest option), OR
  //   (b) Extend the MUI palette via `declare module "@mui/material/styles"` to
  //       add a first-class `accent` slot and remove this workaround.
  // Until then, reference the accent as `color="warning"` on MUI components
  // and `"warning.main"` in sx props.
  warning: {
    main: "#F2C55A",
    light: "#F7D987",
    dark: "#C9A030",
    contrastText: "#1A1208",
  },

  error: {
    main: "#B84035",
    light: "#D4675C",
    dark: "#8C2E25",
    contrastText: "#FFFFFF",
  },

  background: {
    default: "#FFFCF7", // candlelight white — the warmth lives here
    paper: "#FFFFFF",
  },

  text: {
    primary: "#1A1208",   // dark roast
    secondary: "#6B5332", // warm walnut
    disabled: "#B8A48A",  // faded warm
  },

  divider: "#EDE4D5", // warm cream — card borders and rule lines
};

export const darkPalette: PaletteOptions = {
  mode: "dark",

  primary: {
    main: "#D4956A",      // lighter amber reads on dark backgrounds
    light: "#E8B490",
    dark: "#B87A4E",
    contrastText: "#1A1208",
  },

  secondary: {
    main: "#F2C55A",
    light: "#F7D987",
    dark: "#C9A030",
    contrastText: "#1A1208",
  },

  warning: {
    main: "#F2C55A",
    light: "#F7D987",
    dark: "#C9A030",
    contrastText: "#1A1208",
  },

  error: {
    main: "#E06050",
    light: "#F08070",
    dark: "#B84035",
    contrastText: "#FFFFFF",
  },

  background: {
    default: "#1A0E05", // very dark warm brown
    paper: "#241508",   // slightly lifted warm surface
  },

  text: {
    primary: "#FAF0E0",   // warm white
    secondary: "#C4A882", // warm muted beige
    disabled: "#7A6050",
  },

  divider: "#3D2A15",
};
