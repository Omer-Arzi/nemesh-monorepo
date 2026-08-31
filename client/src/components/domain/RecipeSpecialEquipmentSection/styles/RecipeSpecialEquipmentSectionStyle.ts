import { alpha } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";

// Sage tones are derived from theme.palette.info (documented in
// freckleWarmPalette.ts as "Sage green — freshness / ingredient accent")
// rather than new hardcoded hex values, mirroring how RecipeTipsSectionStyle
// derives its card from theme.palette.warning.
export const RecipeSpecialEquipmentSectionStyle = {
  // A block box with width:fit-content shrink-wraps to its content while
  // still starting flush at the container's inline-start edge — which is
  // the visual RIGHT under dir="rtl" — so it self-aligns right with no
  // separate flex/justify wrapper needed. minWidth keeps a single short
  // item from reading as a tiny floating badge; maxWidth caps growth and
  // hands overflow to chipsRow's flexWrap instead of a wide empty card.
  root: (theme: Theme) => ({
    mx: { xs: 2, sm: 3, md: 4 },
    my: { xs: 1.5, sm: 2 },
    width: { xs: "auto", md: "fit-content" },
    minWidth: { md: 360 },
    maxWidth: { xs: "100%", md: 680 },
    bgcolor: alpha(theme.palette.info.main, 0.08),
    border: "1px solid",
    borderColor: alpha(theme.palette.info.main, 0.3),
    borderRadius: 3,
    px: { xs: 2.5, sm: 3 },
    py: { xs: 1.75, sm: 2 },
  }),

  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: 1,
    mb: 1.25,
  },

  titleIcon: {
    fontSize: 20,
    color: "info.main",
    flexShrink: 0,
  },

  title: {
    fontWeight: 700,
    fontSize: "0.95rem",
    color: "info.main",
  },

  chipsRow: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 1,
  },

  // height: "auto" overrides MUI's fixed 24px small-Chip height so the label
  // padding below applies equally on all four sides instead of being
  // horizontal-only against a fixed-height pill.
  chip: (theme: Theme) => ({
    height: "auto",
    bgcolor: "background.paper",
    color: "text.secondary",
    borderColor: alpha(theme.palette.info.main, 0.3),
    fontWeight: 500,
    "& .MuiChip-label": {
      px: 1,
      py: 0.3,
    },
  }),
} as const;
