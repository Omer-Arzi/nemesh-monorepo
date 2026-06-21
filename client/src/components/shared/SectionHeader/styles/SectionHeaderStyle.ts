export const SectionHeaderStyle = {
  root: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 2,
    mb: 3,
  },
  titleGroup: {
    // intentionally unstyled — children (Typography) carry their own styles
  },
  subtitle: {
    mt: 0.5,
  },
  actionSlot: {
    flexShrink: 0,
  },
} as const;
