export const PreparationStepsSectionStyle = {
  sectionHeaderRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexWrap: "wrap" as const,
    gap: 1,
    mb: 0,
  },
  sectionHeaderActions: {
    display: "flex",
    alignItems: "center",
    gap: 1,
    flexWrap: "wrap" as const,
    pt: 0.5,
  },
  progressChip: {
    fontSize: "0.72rem",
    height: 22,
  },
  resetButton: {
    fontSize: "0.75rem",
    color: "text.secondary",
    whiteSpace: "nowrap" as const,
  },
  sectionGroup: {
    // Vertical gap between consecutive named sections.
    "&:not(:first-of-type)": {
      mt: 4,
    },
  },
  sectionTitle: {
    display: "block",
    fontWeight: 700,
    mb: 1.5,
    color: "text.secondary",
  },
} as const;
