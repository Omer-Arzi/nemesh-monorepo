export const ShirChallengeStatusPanelStyle = {
  // ── Outer accordion panel ──────────────────────────────────────────────────
  // overflow:hidden clips the button bg to the rounded corners.
  // divider border is used for all states — status is signalled by the header bg.
  panel: {
    border: "1px solid",
    borderColor: "divider",
    borderRadius: 3,
    overflow: "hidden" as const,
    mb: { xs: 3, sm: 4 },
  },

  // ── Accordion header — the clickable trigger ───────────────────────────────
  // Active: surface.alt (warm section tone — signals "something live here").
  // Neutral: action.hover (subtle tint — muted, not calling for attention).
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    px: { xs: 2, sm: 2.5 },
    py: 1.5,
    bgcolor: "surface.alt",
    border: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    textAlign: "unset" as const,
    "&:focus-visible": {
      outline: "2px solid",
      outlineColor: "primary.main",
      outlineOffset: "-2px",
    },
    "&:active": { opacity: 0.85 },
  },
  headerNeutral: {
    bgcolor: "action.hover",
  },

  // Left side of header in RTL: title + status chip
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

  // ── Status chip (header only) ──────────────────────────────────────────────
  // Active: honey yellow (warning.main) — "live / in progress".
  // Neutral: subtle muted chip — not competing with primary actions.
  statusChip: {
    display: "inline-block",
    bgcolor: "warning.main",
    color: "warning.contrastText",
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

  // ── Chevron ────────────────────────────────────────────────────────────────
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

  // ── Card row (1 or 2 inner cards) ─────────────────────────────────────────
  cardRow: {
    display: "flex",
    flexDirection: { xs: "column", sm: "row" } as const,
    alignItems: "flex-start",
    gap: 1.5,
  },

  // ── Base inner card ────────────────────────────────────────────────────────
  card: {
    border: "1px solid",
    borderColor: "divider",
    borderRadius: 2,
    overflow: "hidden" as const,
    flex: 1,
    minWidth: 0,
  },

  // ── Current month card ─────────────────────────────────────────────────────
  // Honey top-border accent signals this is the live/active card.
  currentCard: {
    borderTopWidth: "2.5px",
    borderTopColor: "warning.main",
    boxShadow: "0 1px 3px rgba(26,18,8,0.06)",
  },
  currentCardAlone: {
    flex: "0 0 auto" as const,
    width: "100%",
    maxWidth: { sm: 720 },
  },

  cardMonthLabel: {
    typography: "caption",
    color: "text.secondary",
    fontWeight: 600,
    letterSpacing: "0.02em",
    display: "block",
    mb: 1.25,
  },

  cardBody: {
    px: { xs: 1.75, sm: 2 },
    py: 1.75,
    bgcolor: "background.paper",
  },

  // ── Stat blocks (active status) ───────────────────────────────────────────
  statRow: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 2.5,
  },
  statBlock: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 0.4,
    minWidth: 80,
  },
  statLabel: {
    fontSize: "0.65rem",
    fontWeight: 600,
    color: "text.secondary",
    letterSpacing: "0.07em",
    textTransform: "uppercase" as const,
    lineHeight: 1.3,
  },
  statValue: {
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "text.primary",
    lineHeight: 1.2,
  },
  // Ingredient name gets a sage accent — differentiates it from progress text
  // and introduces the info color role in a content-appropriate way.
  statValueIngredient: {
    color: "info.main",
  },

  note: {
    typography: "body2",
    color: "text.secondary",
    mt: 1.25,
    pt: 1.25,
    borderTop: "1px solid",
    borderColor: "divider",
    lineHeight: 1.7,
  },

  // ── Previous month card ────────────────────────────────────────────────────
  prevCard: {
    bgcolor: "background.paper",
  },

  prevCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 1,
    px: { xs: 1.75, sm: 2 },
    py: 0.875,
    bgcolor: "action.hover",
    borderBottom: "1px solid",
    borderColor: "divider",
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
    px: { xs: 1.75, sm: 2 },
    py: 1.5,
  },

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
