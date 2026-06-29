import { alpha } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";

export const HomeSearchHeroStyle = {
  // ── No background image — gradient tint only ───────────────────────────────
  root: (theme: Theme) => ({
    width: "100%",
    py: { xs: 3, sm: 10, md: 14 },
    px: { xs: 2, sm: 4 },
    background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.09)} 0%, transparent 100%)`,
  }),

  // ── With a Strapi background image ────────────────────────────────────────
  // position:relative + overflow:hidden contain the fill-mode NemeshImage.
  // Padding matches the no-image root so layout does not shift.
  rootWithImage: {
    position: "relative" as const,
    overflow: "hidden" as const,
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
