import { alpha } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";

export const HomeSearchHeroStyle = {
  root: (theme: Theme) => ({
    width: "100%",
    // Mobile: compact — 24px breathing room. Search should appear early in the
    // viewport, not buried under editorial padding.
    // Desktop: generous — wide screens need the vertical space to anchor the hero.
    py: { xs: 3, sm: 10, md: 14 },
    px: { xs: 2, sm: 4 },
    background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.09)} 0%, transparent 100%)`,
  }),

  inner: {
    maxWidth: 600,
    mx: "auto",
    alignItems: "center",
    // Mobile: 8px — tight rhythm; headline→search feels like a single unit.
    // Desktop: 16px — more breathing room to separate the larger elements.
    gap: { xs: 1, sm: 2 },
  },

  headline: {
    // Mobile: 1.25rem / 700 — at this size "האוכל שמתאים למה שיש בבית"
    // fits in one line on 390px+ widths (Heebo is naturally condensed).
    // One line means users read the context label at a glance and immediately
    // see the search bar — no multi-line statement to process first.
    // Weight 700: confident without dominating. The search is the primary action.
    //
    // Desktop: 2.25rem / 800 — headline anchors a wide-screen editorial hero.
    fontSize: { xs: "1.25rem", sm: "2.25rem" },
    fontWeight: { xs: 700, sm: 800 },
    lineHeight: { xs: 1.3, sm: 1.25 },
    textAlign: "center",
    color: "text.primary",
  },

  subtitle: {
    // Hidden on mobile: the subtitle describes what the search does, but the
    // placeholder "חפשו מתכון או מרכיב..." already communicates that inside
    // the field. Keeping both is a desktop editorial pattern. On mobile, removing
    // this line brings the search bar 26px higher in the viewport.
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
