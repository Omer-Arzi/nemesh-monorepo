export const ErrorStateStyle = {
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
  description: {
    maxWidth: 400,
  },
  action: {
    mt: 1,
  },
} as const;
