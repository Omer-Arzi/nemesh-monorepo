import type { PaletteOptions } from "@mui/material/styles";

export const freckleWarmLightPalette: PaletteOptions = {
  mode: "light",

  primary: {
    main: "#C96A2E",
    light: "#E6A36F",
    dark: "#8F3F1F",
    contrastText: "#FFFFFF",
  },

  // Shifted from honey-gold to cinnamon-brown for a richer freckle identity.
  secondary: {
    main: "#A86A3D",
    light: "#C8906A",
    dark: "#7A4A28",
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
    default: "#FFF8EE",
    paper: "#FFFFFF",
  },

  text: {
    primary: "#24160E",
    secondary: "#765A45",
    disabled: "#BCA58C",
  },

  divider: "#E7CBB6",

  // Solid warm tints — more predictable than rgba across different surface colors.
  action: {
    hover: "#F6E8DD",
    selected: "#F2DDD0",
    focus: "rgba(201, 106, 46, 0.14)",
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
