export const PreparationStepsStyle = {
  list: {
    listStyle: "none",
    p: 0,
    m: 0,
  },
  step: {
    display: "flex",
    gap: 2,
    py: 2,
    borderBottom: 1,
    borderColor: "divider",
    "&:last-child": { borderBottom: 0 },
  },
  stepNumber: {
    flexShrink: 0,
    width: 32,
    height: 32,
    borderRadius: "50%",
    bgcolor: "primary.main",
    color: "primary.contrastText",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    mt: 0.25,
  },
  stepNumberText: {
    fontWeight: 700,
  },
  stepContent: {
    flexGrow: 1,
  },
  stepImage: {
    mt: 1.5,
    width: "100%",
    maxWidth: 480,
    borderRadius: 1,
    objectFit: "cover",
    display: "block",
  },
} as const;
