// Global MUI palette augmentation — no imports so TypeScript applies this
// declaration to every file in the project without needing an explicit import.
//
// Add custom palette slots here instead of spreading ad-hoc hex values across
// component style files. Each slot must also be set in every palette option
// object (classic lightPalette / darkPalette and every preset variant).

// export {} makes this a module, so `declare module` below is treated as a
// module augmentation (extends existing exports) rather than an ambient module
// declaration (would replace the entire @mui/material/styles module).
export {};

declare module "@mui/material/styles" {
  interface Palette {
    surface: {
      /** Warm section band — highlighted areas, carousels, outer panels. */
      alt: string;
      /** Dedicated image-slot surface — clearly distinct from page and card. */
      placeholder: string;
    };
    /**
     * Internal recipe-to-recipe ingredient links (e.g. "ריבת לימון" linking to
     * the lemon-jam recipe). Deliberately distinct from `primary` (brand) and
     * `text.secondary` (ingredient notes) so the link reads as its own thing.
     * Values are measured to meet WCAG AA (>=4.5:1) against every background
     * ingredients can render on: background.default and background.paper, in
     * both light/dark and both theme presets.
     */
    ingredientLink: {
      main: string;
      /** Intentional visited state — replaces the browser's default purple. */
      visited: string;
    };
  }

  interface PaletteOptions {
    surface?: {
      alt?: string;
      placeholder?: string;
    };
    ingredientLink?: {
      main?: string;
      visited?: string;
    };
  }
}
