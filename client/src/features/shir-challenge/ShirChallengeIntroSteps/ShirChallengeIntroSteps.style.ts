import { SHIR_CHALLENGE_TOKENS } from "../ShirChallenge.tokens";

export const ShirChallengeIntroStepsStyle = {
  root: {
    mb: { xs: 3, sm: 4 },
  },
  sectionTitle: {
    fontWeight: 700,
    mb: 2.5,
  },
  steps: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 2.5,
  },
  step: {
    display: "flex",
    gap: 2,
    alignItems: "flex-start",
  },
  stepNumber: {
    flexShrink: 0,
    width: 32,
    height: 32,
    borderRadius: "50%",
    bgcolor: SHIR_CHALLENGE_TOKENS.peachChip,
    color: SHIR_CHALLENGE_TOKENS.peachAccent,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    typography: "body2",
    mt: 0.2,
  },
  stepTitle: {
    fontWeight: 600,
    mb: 0.4,
    color: "text.primary",
  },
  stepDescription: {
    color: "text.secondary",
    lineHeight: 1.65,
  },
} as const;
