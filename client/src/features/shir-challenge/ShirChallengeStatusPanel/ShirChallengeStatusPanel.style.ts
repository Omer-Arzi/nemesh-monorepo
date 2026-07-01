export const ShirChallengeStatusPanelStyle = {
  // ── Outer accordion panel ──────────────────────────────────────────────────
  panel: {
    border: "1px solid",
    borderColor: "divider",
    borderRadius: 3,
    overflow: "hidden" as const,
    mb: { xs: 3, sm: 4 },
  },

  // ── Accordion header ───────────────────────────────────────────────────────
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    px: { xs: 2, sm: 2.5 },
    py: 1.5,
    bgcolor: "primary.light",
    border: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    textAlign: "unset" as const,
    "&:focus-visible": {
      outline: "2px solid",
      outlineColor: "primary.light",
      outlineOffset: "-2px",
    },
    "&:active": { opacity: 0.85 },
  },
  headerNeutral: {
  bgcolor: "primary.light",
  },

  headerStart: {
    display: "flex",
    alignItems: "center",
    gap: 1.25,
    flex: 1,
    minWidth: 0,
  },

  headerTitle: {
    typography: "body2",
    fontWeight: 700,
    color: "text.primary",
  },

  statusChip: {
    display: "inline-block",
    bgcolor: "warning.main",
    color: "warning.contrastText",
    border: "1px solid",
    borderColor: "white",
    px: 1,
    py: 0.2,
    borderRadius: 1.5,
    typography: "caption",
    fontWeight: 700,
    lineHeight: 1.4,
    flexShrink: 0,
  },
  statusChipNeutral: {
    color: "warning.contrastText",
    borderColor: "action.selected",
  },

  chevron: {
    display: "block",
    color: "text.secondary",
    transition: "transform 250ms ease",
    flexShrink: 0,
    fontSize: "1.125rem",
  },

  // ── Accordion body ─────────────────────────────────────────────────────────
  body: {
    borderTop: "1px solid",
    borderColor: "divider",
    p: { xs: 1.5, sm: 2 },
  },

  // ── Card row ───────────────────────────────────────────────────────────────
  // alignItems: "stretch" makes both cards fill the row height so neither
  // looks smaller than the other when one has less content.
  cardRow: {
    display: "flex",
    flexDirection: { xs: "column", sm: "row" } as const,
    alignItems: "stretch",
    gap: 1.5,
  },

  // Applied to the current card when no previous month exists.
  currentCardAlone: {
    flex: "0 0 auto" as const,
    width: "100%",
    maxWidth: { sm: 720 },
  },
} as const;
