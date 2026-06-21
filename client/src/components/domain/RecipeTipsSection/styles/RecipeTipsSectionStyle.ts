export const RecipeTipsSectionStyle = {
  tipItem: {
    display: "flex",
    gap: 1.5,
    py: 1.5,
    borderBottom: 1,
    borderColor: "divider",
    "&:last-child": { borderBottom: 0 },
  },
  tipBullet: {
    flexShrink: 0,
    color: "primary.main",
    fontSize: 20,
    mt: 0.1,
  },
} as const;
