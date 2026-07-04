export const IngredientListStyle = {
  listItem: {
    py: 0.75,
    borderBottom: 1,
    borderColor: "divider",
    flexDirection: "column",
    alignItems: "flex-start",
    "&:last-child": { borderBottom: 0 },
  },
  listItemClickable: {
    flexDirection: "row" as const,
    alignItems: "flex-start",
    gap: 1,
    cursor: "pointer",
    userSelect: "none" as const,
    touchAction: "manipulation" as const,
    transition: "background-color 0.12s ease",
    borderRadius: 1,
    px: 0.5,
    "&:active": { bgcolor: "action.hover" },
  },
  listItemChecked: {
    bgcolor: "action.hover",
  },
  note: {
    display: "block",
    fontSize: "0.72em",
    color: "text.secondary",
    fontWeight: "normal",
    lineHeight: 1.3,
    mt: 0.25,
  },
  checkIcon: {
    fontSize: "1.1rem",
    flexShrink: 0,
    mt: 0.25,
  },
  checkIconDone: {
    color: "success.main",
  },
  checkIconEmpty: {
    color: "text.disabled",
  },
  textChecked: {
    opacity: 0.45,
    transition: "opacity 0.15s ease",
  },
} as const;
