import type { PaletteOptions } from "@mui/material/styles";

export const freckleWarmLightPalette: PaletteOptions = {
  mode: "light",

  // Burnt cinnamon — slightly deeper than classic's toasted crust.
  primary: {
    main: "#B85E2B",
    light: "#D98C59",
    dark: "#7A381C",
    contrastText: "#FFFFFF",
  },

  // Deep cinnamon brown — muted secondary that sits behind primary.
  secondary: {
    main: "#8B5A3C",
    light: "#B5805F",
    dark: "#60361F",
    contrastText: "#FFFFFF",
  },

  // Honey gold — the accent color for status chips, accent bars, active indicators.
  warning: {
    main: "#D9A441",
    light: "#ECC76E",
    dark: "#A8781E",
    contrastText: "#24160D",
  },

  // Sage green — freshness / ingredient accent. Used sparingly.
  info: {
    main: "#667A55",
    light: "#8DA07E",
    dark: "#4A5A3D",
    contrastText: "#FFFFFF",
  },

  error: {
    main: "#B84035",
    light: "#D4675C",
    dark: "#8C2E25",
    contrastText: "#FFFFFF",
  },

  background: {
    default: "#FBF6EF", // warm parchment — the freckle identity lives here
    paper: "#FFFDFC",   // near-white cards — clearly distinct from the page
  },

  text: {
    primary: "#26170F",
    secondary: "#6B5648",
    disabled: "#B79D87",
  },

  divider: "#E1CFBB",

  action: {
    hover: "#F6EADD",
    selected: "#F0DFCF",
    focus: "rgba(184, 94, 43, 0.14)",
  },

  // ── Custom surface tokens (augmented in themeAugmentation.d.ts) ────────────
  surface: {
    alt: "#EEDFCB",         // warm section bands — carousel, outer panels
    placeholder: "#E9D7C4", // image placeholder areas — distinct from page and card
  },

  // Same dark green as the classic preset — measured 6.8–7.3:1 against
  // #FBF6EF/#FFFDFC (this preset's ingredient backgrounds).
  ingredientLink: {
    main: "#465C3B",
    visited: "#5C6E52",
  },
};

export const freckleWarmDarkPalette: PaletteOptions = {
  mode: "dark",

  primary: {
    main: "#E39B67",
    light: "#F0B88A",
    dark: "#C96F32",
    contrastText: "#24160D",
  },

  secondary: {
    main: "#C89A78",
    light: "#E0BDA0",
    dark: "#9A7050",
    contrastText: "#24160D",
  },

  warning: {
    main: "#F0C35F",
    light: "#F7D98A",
    dark: "#C48A1A",
    contrastText: "#24160D",
  },

  info: {
    main: "#8DA07E",
    light: "#AABF9C",
    dark: "#667A55",
    contrastText: "#1C110B",
  },

  error: {
    main: "#E06050",
    light: "#F08070",
    dark: "#B84035",
    contrastText: "#FFFFFF",
  },

  background: {
    default: "#1C110B",
    paper: "#3B2A21",
  },

  text: {
    primary: "#FAF1E5",
    secondary: "#D1B8A0",
    disabled: "#7D6248",
  },

  divider: "#7E5946",

  surface: {
    alt: "#2B1A0D",
    placeholder: "#3A2415",
  },

  // Same light sage green as the classic dark preset — measured 6.1–8.3:1
  // against this preset's dark backgrounds.
  ingredientLink: {
    main: "#9CB58A",
    visited: "#B4C7A6",
  },
};
