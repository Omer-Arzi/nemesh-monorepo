import { SHIR_CHALLENGE_TOKENS } from "../ShirChallenge.tokens";

export const ShirChallengeStatusPanelStyle = {
  // ── Outer container ─────────────────────────────────────────────────────
  root: {
    border: "1px solid",
    borderColor: SHIR_CHALLENGE_TOKENS.peachChip,
    borderRadius: 2.5,
    overflow: "hidden" as const,
    mb: { xs: 3, sm: 4 },
  },
  rootNeutral: {
    // pending or skipped: softer border
    borderColor: "divider",
  },

  // ── Collapsible header (rendered as <button>) ────────────────────────────
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    gap: 1.5,
    px: { xs: 2, sm: 2.5 },
    py: 1.5,
    bgcolor: SHIR_CHALLENGE_TOKENS.peachSurface,
    cursor: "pointer",
    border: "none",
    fontFamily: "inherit",
    textAlign: "unset" as const,
    "&:hover": { bgcolor: "#FDEADE" },
    "&:focus-visible": {
      outline: "2px solid",
      outlineColor: "primary.main",
      outlineOffset: "-2px",
    },
  },
  headerNeutral: {
    bgcolor: "action.hover",
    "&:hover": { bgcolor: "action.selected" },
  },

  titleGroup: {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    minWidth: 0,
  },
  title: {
    fontWeight: 700,
    fontSize: "0.875rem",
    color: "text.primary",
  },

  // ── Status chip ──────────────────────────────────────────────────────────
  statusChip: {
    display: "inline-block",
    bgcolor: SHIR_CHALLENGE_TOKENS.peachChip,
    color: SHIR_CHALLENGE_TOKENS.peachAccent,
    px: 1.25,
    py: 0.35,
    borderRadius: 1.5,
    typography: "caption",
    fontWeight: 700,
    flexShrink: 0,
    lineHeight: 1.4,
  },
  statusChipNeutral: {
    // pending or skipped
    bgcolor: "action.selected",
    color: "text.secondary",
  },

  chevron: {
    display: "block",
    color: "text.secondary",
    transition: "transform 250ms ease",
    flexShrink: 0,
    fontSize: "1.25rem",
  },

  // ── Expanded body ────────────────────────────────────────────────────────
  body: {
    px: { xs: 2, sm: 2.5 },
    pt: 2,
    pb: 2.5,
    bgcolor: "background.paper",
    borderTop: "1px solid",
    borderColor: SHIR_CHALLENGE_TOKENS.peachChip,
  },
  bodyNeutral: {
    borderColor: "divider",
  },

  // ── Data rows (label + value) ────────────────────────────────────────────
  row: {
    display: "flex",
    alignItems: "baseline",
    gap: 1,
    mb: 1.25,
  },
  rowLabel: {
    typography: "caption",
    color: "text.secondary",
    fontWeight: 600,
    flexShrink: 0,
    minWidth: 100,
    letterSpacing: "0.02em",
  },
  rowValue: {
    typography: "body2",
    color: "text.primary",
    fontWeight: 600,
  },

  // ── Note ─────────────────────────────────────────────────────────────────
  note: {
    typography: "body2",
    color: "text.secondary",
    mt: 2,
    pt: 2,
    borderTop: "1px solid",
    borderColor: "divider",
    lineHeight: 1.7,
  },

  // ── Previous month section ───────────────────────────────────────────────
  prevSection: {
    mt: 2.5,
    pt: 2,
    borderTop: "1px solid",
    borderColor: "divider",
  },
  prevTitle: {
    typography: "caption",
    color: "text.secondary",
    fontWeight: 700,
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
    mb: 1.25,
    display: "block",
  },
  prevRow: {
    display: "flex",
    alignItems: "center",
    gap: 1,
    mb: 0.75,
    "&:last-child": { mb: 0 },
  },
  prevRowLabel: {
    typography: "caption",
    color: "text.secondary",
    flexShrink: 0,
    minWidth: 100,
  },
  prevRowValue: {
    typography: "caption",
    color: "text.primary",
    fontWeight: 600,
  },
  prevChip: {
    display: "inline-block",
    border: "1px solid",
    borderColor: "divider",
    color: "text.secondary",
    px: 1,
    py: 0.2,
    borderRadius: 1,
    typography: "caption",
    fontWeight: 600,
    lineHeight: 1.4,
  },
} as const;
