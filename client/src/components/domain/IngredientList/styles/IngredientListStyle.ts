export const IngredientListStyle = {
  listItem: {
    py: 0.75,
    borderBottom: 1,
    borderColor: "divider",
    flexDirection: "column",
    alignItems: "flex-start",
    "&:last-child": { borderBottom: 0 },
  },
  note: {
    display: "block",
    fontSize: "0.72em",
    color: "text.secondary",
    fontWeight: "normal",
    lineHeight: 1.3,
    mt: 0.25,
  },
} as const;
