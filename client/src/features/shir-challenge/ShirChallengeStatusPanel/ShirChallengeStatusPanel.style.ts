import { SHIR_CHALLENGE_TOKENS } from "../ShirChallenge.tokens";

export const ShirChallengeStatusPanelStyle = {
  // ── Outer section wrapper ────────────────────────────────────────────────
  section: {
    mb: { xs: 3, sm: 4 },
  },

  // ── Collapse trigger (lightweight full-width button) ─────────────────────
  trigger: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    mb: 1.5,
    py: 1.25,
    cursor: "pointer",
    border: "none",
    bgcolor: "transparent",
    fontFamily: "inherit",
    textAlign: "unset" as const,
    "&:focus-visible": {
      outline: "2px solid",
      outlineColor: "primary.main",
      outlineOffset: "3px",
      borderRadius: 1,
    },
  },

  triggerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 1.25,
  },

  triggerLabel: {
    typography: "caption",
    color: "text.secondary",
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
  },

  // ── Status chip (used both in trigger and in current card header) ─────────
  statusChip: {
    display: "inline-block",
    bgcolor: SHIR_CHALLENGE_TOKENS.peachChip,
    color: SHIR_CHALLENGE_TOKENS.peachAccent,
    px: 1.25,
    py: 0.3,
    borderRadius: 1.5,
    typography: "caption",
    fontWeight: 700,
    lineHeight: 1.4,
    flexShrink: 0,
  },
  statusChipNeutral: {
    bgcolor: "action.selected",
    color: "text.secondary",
  },

  // ── Chevron ───────────────────────────────────────────────────────────────
  chevron: {
    display: "block",
    color: "text.secondary",
    transition: "transform 250ms ease",
    flexShrink: 0,
    fontSize: "1.125rem",
  },

  // ── Card row (holds 1 or 2 cards) ────────────────────────────────────────
  cardRow: {
    display: "flex",
    flexDirection: { xs: "column", sm: "row" } as const,
    alignItems: "flex-start",
    gap: 2,
  },

  // ── Base card (shared by current + previous) ─────────────────────────────
  card: {
    borderRadius: 2,
    overflow: "hidden" as const,
    // Mobile: always full width; desktop: flex 1
    width: "100%",
    flex: 1,
    minWidth: 0,
  },

  // ── Current month card ────────────────────────────────────────────────────
  currentCard: {
    border: "1px solid",
    borderColor: SHIR_CHALLENGE_TOKENS.peachChip,
  },
  currentCardNeutral: {
    borderColor: "divider",
  },
  // Applied only when there is no previous month record
  currentCardAlone: {
    flex: "0 0 auto" as const,
    maxWidth: { sm: 720 },
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 1,
    px: { xs: 2, sm: 2.5 },
    py: 1.25,
    bgcolor: SHIR_CHALLENGE_TOKENS.peachSurface,
  },
  cardHeaderNeutral: {
    bgcolor: "action.hover",
  },

  // Month name shown in the current card header
  cardHeaderMonth: {
    typography: "body2",
    fontWeight: 700,
    color: "text.primary",
  },

  cardBody: {
    px: { xs: 2, sm: 2.5 },
    pt: 1.75,
    pb: 2,
    bgcolor: "background.paper",
    borderTop: "1px solid",
    borderColor: SHIR_CHALLENGE_TOKENS.peachChip,
  },
  cardBodyNeutral: {
    borderColor: "divider",
  },

  // ── Data rows in current card ─────────────────────────────────────────────
  row: {
    display: "flex",
    alignItems: "baseline",
    gap: 1,
    mb: 1,
    "&:last-child": { mb: 0 },
  },
  rowLabel: {
    typography: "caption",
    color: "text.secondary",
    fontWeight: 600,
    flexShrink: 0,
    minWidth: 80,
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
    mt: 1.5,
    pt: 1.5,
    borderTop: "1px solid",
    borderColor: "divider",
    lineHeight: 1.7,
  },

  // ── Previous month card ───────────────────────────────────────────────────
  prevCard: {
    border: "1px solid",
    borderColor: "divider",
  },

  prevCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 1,
    px: { xs: 2, sm: 2.5 },
    py: 1.25,
    bgcolor: "action.hover",
  },

  prevCardTitle: {
    typography: "caption",
    color: "text.secondary",
    fontWeight: 700,
    letterSpacing: "0.03em",
    flex: 1,
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
    flexShrink: 0,
  },

  prevCardBody: {
    px: { xs: 2, sm: 2.5 },
    pt: 1.75,
    pb: 2,
    bgcolor: "background.paper",
    borderTop: "1px solid",
    borderColor: "divider",
  },

  // ── Data rows in previous card ────────────────────────────────────────────
  prevRow: {
    display: "flex",
    alignItems: "baseline",
    gap: 1,
    mb: 0.875,
    "&:last-child": { mb: 0 },
  },
  prevRowLabel: {
    typography: "caption",
    color: "text.secondary",
    flexShrink: 0,
    minWidth: 80,
  },
  prevRowValue: {
    typography: "caption",
    color: "text.primary",
    fontWeight: 600,
  },
} as const;
