export const EmptyStateStyle = {
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    gap: 2,
    py: 8,
    px: 2,
  },
  iconWrapper: {
    color: "text.disabled",
    fontSize: 64,
    lineHeight: 1,
  },
  description: {
    maxWidth: 400,
  },
  action: {
    mt: 1,
  },
} as const;
