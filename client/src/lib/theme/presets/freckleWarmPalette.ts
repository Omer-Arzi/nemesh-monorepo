import type { PaletteOptions } from "@mui/material/styles";

export const freckleWarmLightPalette: PaletteOptions = {
  mode: "light",

  primary: {
    main: "#B85B2A",
    light: "#D9824D",
    dark: "#7A3518",
    contrastText: "#FFFFFF",
  },

  secondary: {
    main: "#E8A933",
    light: "#F0C460",
    dark: "#B97712",
    contrastText: "#24160D",
  },

  warning: {
    main: "#F0B84A",
    light: "#F5D17A",
    dark: "#C48A1A",
    contrastText: "#24160D",
  },

  error: {
    main: "#B84035",
    light: "#D4675C",
    dark: "#8C2E25",
    contrastText: "#FFFFFF",
  },

  background: {
    default: "#FFF7EF",
    paper: "#FFFFFF",
  },

  text: {
    primary: "#24160D",
    secondary: "#76563B",
    disabled: "#BCA58C",
  },

  divider: "#E6C9A9",

  // Warm-tinted interaction states so hovers/selections stay on-brand
  // instead of defaulting to MUI's cool-gray overlays.
  action: {
    hover: "rgba(184, 91, 42, 0.06)",
    selected: "rgba(184, 91, 42, 0.10)",
    focus: "rgba(184, 91, 42, 0.14)",
  },
};

export const freckleWarmDarkPalette: PaletteOptions = {
  mode: "dark",

  primary: {
    main: "#DD9562",
    light: "#F0B585",
    dark: "#C96F32",
    contrastText: "#24160D",
  },

  secondary: {
    main: "#E8A933",
    light: "#F0C460",
    dark: "#C48A1A",
    contrastText: "#24160D",
  },

  warning: {
    main: "#E8A933",
    light: "#F0C460",
    dark: "#C48A1A",
    contrastText: "#24160D",
  },

  error: {
    main: "#E06050",
    light: "#F08070",
    dark: "#B84035",
    contrastText: "#FFFFFF",
  },

  background: {
    default: "#1A0C04",
    paper: "#261208",
  },

  text: {
    primary: "#FAF0E0",
    secondary: "#C8AA82",
    disabled: "#7D6248",
  },

  divider: "#3E2818",
};
