import { alpha } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";

export const HomeSearchHeroStyle = {
  root: (theme: Theme) => ({
    width: "100%",
    py: { xs: 10, sm: 12, md: 14 },
    px: { xs: 2, sm: 4 },
    background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.09)} 0%, transparent 100%)`,
  }),

  inner: {
    maxWidth: 600,
    mx: "auto",
    alignItems: "center",
    gap: 2,
  },

  headline: {
    fontWeight: 800,
    lineHeight: 1.25,
    textAlign: "center",
    color: "text.primary",
  },

  subtitle: {
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
