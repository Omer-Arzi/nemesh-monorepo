export const ChallengeStatusCardStyle = {
  // ── Base card shell ────────────────────────────────────────────────────────
  card: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 0.25,
    border: "1px solid",
    borderColor: "divider",
    borderRadius: 2.5,
    p: { xs: 2, sm: 2.25 },
    flex: 1,
    minWidth: 0,
    overflow: "hidden" as const,
    bgcolor: "background.paper",
  },

  // ── Current-card accent ────────────────────────────────────────────────────
  // Light cinnamon border marks the current card in all states, including
  // pending/empty — gives the card a warm identity even when it has no ingredient.
  currentCard: {
    borderColor: "primary.light",
  },

  // Active state escalates to the full primary cinnamon + soft shadow.
  currentCardActive: {
    borderColor: "primary.main",
    boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
  },

  // ── Previous-card ──────────────────────────────────────────────────────────
  // Same background.paper surface as the current card — true siblings.
  // Plain divider border (vs. primary.light on current) is the only distinction.
  previousCard: {},

  // ── Context badge ──────────────────────────────────────────────────────────
  // "האתגר החודשי" / "האתגר הקודם" — always the first thing in the card.
  badge: {
    display: "block",
    typography: "caption",
    color: "text.secondary",
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
    mb: 0.75,
  },

  // Dark cinnamon (primary.dark) — warm and readable without being bright gold.
  badgeCurrent: {
    color: "primary.dark",
  },

  // ── Inline label: value rows ───────────────────────────────────────────────
  row: {
    display: "block",
    lineHeight: 1.6,
  },

  rowLabel: {
    display: "inline",
    fontSize: "0.78rem",
    color: "text.secondary",
    fontWeight: 600,
  },

  rowValue: {
    display: "inline",
    fontSize: "0.875rem",
    color: "text.primary",
    fontWeight: 500,
  },

  // Ingredient value is slightly bolder to stay visually central.
  rowValueIngredient: {
    fontWeight: 700,
  },

  // ── Note ──────────────────────────────────────────────────────────────────
  // Optional free-text note below ingredient for the active current card.
  note: {
    typography: "body2",
    color: "text.secondary",
    mt: 0.75,
    pt: 0.75,
    borderTop: "1px solid",
    borderColor: "divider",
    lineHeight: 1.7,
  },
} as const;
