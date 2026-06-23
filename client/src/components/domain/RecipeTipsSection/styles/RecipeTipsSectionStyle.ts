import { alpha } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";

export const RecipeTipsSectionStyle = {
  root: (theme: Theme) => ({
    mx: { xs: 2, sm: 3, md: 4 },
    my: { xs: 1.5, sm: 2 },
    bgcolor: alpha(theme.palette.warning.main, 0.10),
    border: "1px solid",
    borderColor: alpha(theme.palette.warning.main, 0.35),
    borderRadius: 3,
    overflow: "hidden",
  }),

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    px: { xs: 2.5, sm: 3 },
    py: { xs: 1.75, sm: 2 },
    cursor: "pointer",
    userSelect: "none" as const,
    "&:active": { bgcolor: "action.hover" },
  },

  // Icon + title sit in their own flex row so the icon aligns with the text
  // baseline rather than floating as a Typography prefix.
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: 1,
  },

  // warning.dark = #C9A030 (deepened Afternoon Gold).
  // Warmer than primary.main against the golden card background.
  titleIcon: {
    fontSize: 20,
    color: "warning.dark",
    flexShrink: 0,
  },

  title: {
    fontWeight: 700,
    fontSize: "0.95rem",
    color: "text.primary",
  },

  expandIcon: {
    color: "text.secondary",
    flexShrink: 0,
    transition: "transform 200ms ease",
  },

  // Gap-based layout: no dividers. Each card is its own surface.
  content: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 1,
    px: { xs: 1.5, sm: 2 },
    pt: 1,
    pb: { xs: 2, sm: 2.5 },
  },

  // White card on golden surface = physical note-card metaphor.
  // Light warm border instead of the divider so the cards still feel cohesive
  // with the outer container without being visually heavy.
  tipCard: (theme: Theme) => ({
    bgcolor: "background.paper",
    border: "1px solid",
    borderColor: alpha(theme.palette.warning.main, 0.25),
    borderRadius: 2,
    px: { xs: 2, sm: 2.5 },
    py: { xs: 1.5, sm: 1.75 },
    width: "90%",
  }),
} as const;
