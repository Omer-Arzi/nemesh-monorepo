"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ChallengeIntroStep } from "@/types/domain";
import { ShirChallengeDefaults } from "../ShirChallenge.consts";
import { ShirChallengeIntroStepsStyle } from "./ShirChallengeIntroSteps.style";

type Props = {
  steps: ChallengeIntroStep[];
};

export default function ShirChallengeIntroSteps({ steps }: Props) {
  if (steps.length === 0) return null;

  return (
    <Box sx={ShirChallengeIntroStepsStyle.root}>
      <Typography variant="h6" component="h2" sx={ShirChallengeIntroStepsStyle.sectionTitle}>
        {ShirChallengeDefaults.introSectionTitle}
      </Typography>

      <Box sx={ShirChallengeIntroStepsStyle.steps}>
        {steps.map((step, i) => (
          <Box key={i} sx={ShirChallengeIntroStepsStyle.step}>
            <Box sx={ShirChallengeIntroStepsStyle.stepNumber}>{i + 1}</Box>
            <Box>
              <Typography variant="subtitle2" sx={ShirChallengeIntroStepsStyle.stepTitle}>
                {step.title}
              </Typography>
              <Typography variant="body2" sx={ShirChallengeIntroStepsStyle.stepDescription}>
                {step.description}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
