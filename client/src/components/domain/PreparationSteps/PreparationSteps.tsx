"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";
import type { PreparationStep } from "@/types/domain";
import { PreparationStepsStyle } from "./styles/PreparationStepsStyle";

type Props = {
  steps: PreparationStep[];
  sx?: SxProps<Theme>;
};

export default function PreparationSteps({ steps, sx }: Props) {
  if (steps.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        אין שלבי הכנה.
      </Typography>
    );
  }

  return (
    <Box component="ol" sx={{ ...PreparationStepsStyle.list, ...sx }}>
      {steps.map((step, index) => (
        <Box key={index} component="li" sx={PreparationStepsStyle.step}>
          <Box aria-hidden sx={PreparationStepsStyle.stepNumber}>
            <Typography variant="caption" sx={PreparationStepsStyle.stepNumberText}>
              {index + 1}
            </Typography>
          </Box>

          <Box sx={PreparationStepsStyle.stepContent}>
            <Typography variant="body1">{step.description}</Typography>
            {step.image && (
              <Box
                component="img"
                src={step.image.url}
                alt={step.image.alt}
                sx={PreparationStepsStyle.stepImage}
              />
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
