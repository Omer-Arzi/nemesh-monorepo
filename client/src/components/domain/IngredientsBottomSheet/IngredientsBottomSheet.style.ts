export const IngredientsBottomSheetStyle = {
  paper: {
    height: "85vh",
    // CSS shorthand wins the specificity battle against MUI Paper's own
    // `border-radius: 4px` shorthand. Individual corner properties can lose
    // depending on Emotion class ordering; a single shorthand declaration is reliable.
    borderRadius: "20px 20px 0 0",
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden",
  },

  handle: {
    width: 36,
    height: 4,
    bgcolor: "divider",
    borderRadius: 2,
    mx: "auto",
    mt: 1.5,
    mb: 0.5,
    flexShrink: 0,
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    px: 3,
    py: 1.5,
    borderBottom: 1,
    borderColor: "divider",
    flexShrink: 0,
    gap: 1,
    flexWrap: "wrap" as const,
  },

  headerStart: {
    display: "flex",
    alignItems: "center",
    gap: 1,
    flexWrap: "wrap" as const,
  },

  headerEnd: {
    display: "flex",
    alignItems: "center",
    gap: 0.5,
    flexShrink: 0,
  },

  headerTitle: {
    fontWeight: 700,
    fontSize: "1.1rem",
  },

  count: {
    fontWeight: "normal",
    color: "text.secondary",
  },

  progressChip: {
    fontSize: "0.72rem",
    height: 22,
  },

  content: {
    flex: 1,
    overflowY: "auto" as const,
    px: 3,
    pt: 1,
    pb: 3,
  },
} as const;
