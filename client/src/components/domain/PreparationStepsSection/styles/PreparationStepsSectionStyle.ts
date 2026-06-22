export const PreparationStepsSectionStyle = {
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
