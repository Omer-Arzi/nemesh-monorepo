import { alpha } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";

export const HomeSearchHeroStyle = {
  // ── No background image — gradient tint only ───────────────────────────────
  // overflow is intentionally absent — the suggestions dropdown must be allowed
  // to extend below this section's boundary.
  root: (theme: Theme) => ({
    position: "relative" as const,
    width: "100%",
    py: { xs: 3, sm: 10, md: 14 },
    px: { xs: 2, sm: 4 },
    background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.09)} 0%, transparent 100%)`,
  }),

  // ── With a Strapi background image ────────────────────────────────────────
  // NemeshImage uses position:absolute + inset:0 so it stays within bounds
  // without overflow:hidden. Keeping overflow visible lets the suggestions
  // dropdown extend below the section boundary.
  rootWithImage: {
    position: "relative" as const,
    width: "100%",
    py: { xs: 3, sm: 10, md: 14 },
    px: { xs: 2, sm: 4 },
  },

  inner: {
    maxWidth: 600,
    mx: "auto",
    alignItems: "center",
    gap: { xs: 1, sm: 2 },
  },

  // Stack must sit above the image and overlay layers.
  innerOnImage: {
    position: "relative" as const,
    zIndex: 1,
  },

  // Desktop-only logo inside the hero (shown when the AppShell navbar is hidden).
  // drop-shadow adds contrast against arbitrary admin background images.
  heroLogo: (hasImage: boolean) => ({
    display: { xs: "none", md: "block" },
    height: 96,
    width: "auto",
    mb: 1,
    filter: hasImage
      ? "drop-shadow(0 2px 12px rgba(0,0,0,0.22))"
      : undefined,
  }),

  headline: {
    fontSize: { xs: "1.25rem", sm: "2.25rem" },
    fontWeight: { xs: 700, sm: 800 },
    lineHeight: { xs: 1.3, sm: 1.25 },
    textAlign: "center",
    color: "text.primary",
  },

  subtitle: {
    display: { xs: "none", sm: "block" },
    textAlign: "center",
    color: "text.secondary",
  },

  form: {
    width: "100%",
    mt: 1,
  },

  // Wraps the TextField + dropdown. position:relative anchors the absolute dropdown.
  searchWrapper: {
    position: "relative" as const,
    width: "100%",
  },

  // Pill-shaped unified search field — button lives inside as end-adornment
  searchField: (theme: Theme) => ({
    "& .MuiOutlinedInput-root": {
      borderRadius: "100px",
      bgcolor: "background.paper",
      boxShadow: `0 4px 24px ${alpha(theme.palette.common.black, 0.08)}`,
      pl: 2,
      pr: 0.75,
      "& fieldset": { border: "none" },
      "&:hover fieldset": { border: "none" },
      "&.Mui-focused fieldset": { border: "none" },
    },
    "& .MuiOutlinedInput-input": {
      py: 1.75,
    },
  }),

  submitButton: {
    borderRadius: "100px",
    px: { xs: 2.5, sm: 3.5 },
    my: 0.75,
    ml: 0.5,
    fontWeight: 700,
    whiteSpace: "nowrap",
    boxShadow: "none",
    "&:hover": { boxShadow: "none" },
  },
} as const;
