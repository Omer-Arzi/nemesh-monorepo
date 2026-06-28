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
  stepClickable: {
    cursor: "pointer",
    userSelect: "none" as const,
    borderRadius: 2,
    px: 0.5,
    mx: -0.5,
    transition: "background-color 0.12s ease",
    "&:active": { bgcolor: "action.hover" },
  },
  stepChecked: {
    bgcolor: "action.hover",
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
    transition: "background-color 0.2s ease",
  },
  stepNumberChecked: {
    bgcolor: "success.main",
  },
  stepNumberText: {
    fontWeight: 700,
  },
  stepCheckIcon: {
    fontSize: "1rem",
  },
  stepContent: {
    flexGrow: 1,
    transition: "opacity 0.15s ease",
  },
  stepContentChecked: {
    opacity: 0.5,
  },
  stepImageWrapper: {
    mt: 1.5,
    maxWidth: 480,
    borderRadius: 1,
    overflow: "hidden",
  },
} as const;
