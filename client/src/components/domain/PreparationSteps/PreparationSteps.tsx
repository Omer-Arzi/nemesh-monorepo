"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import type { SxProps, Theme } from "@mui/material/styles";
import type { PreparationStep } from "@/types/domain";
import type { CookingModeStepProps } from "@/features/cooking-mode";
import { PreparationStepsStyle } from "./styles/PreparationStepsStyle";

type Props = {
  steps: PreparationStep[];
  sx?: SxProps<Theme>;
  cookingMode?: CookingModeStepProps;
};

export default function PreparationSteps({ steps, sx, cookingMode }: Props) {
  if (steps.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        אין שלבי הכנה.
      </Typography>
    );
  }

  return (
    <Box component="ol" sx={{ ...PreparationStepsStyle.list, ...sx }}>
      {steps.map((step, index) => {
        const itemKey = cookingMode ? `${cookingMode.sectionIndex}:${index}` : undefined;
        const isChecked = itemKey ? cookingMode!.checkedKeys.includes(itemKey) : false;

        return (
          <Box
            key={index}
            component="li"
            onClick={
              cookingMode?.isActive && itemKey
                ? () => cookingMode.onToggle(itemKey)
                : undefined
            }
            sx={[
              PreparationStepsStyle.step,
              cookingMode?.isActive ? PreparationStepsStyle.stepClickable : false,
              isChecked ? PreparationStepsStyle.stepChecked : false,
            ]}
          >
            <Box
              aria-hidden
              sx={[
                PreparationStepsStyle.stepNumber,
                isChecked ? PreparationStepsStyle.stepNumberChecked : false,
              ]}
            >
              {isChecked ? (
                <CheckIcon sx={PreparationStepsStyle.stepCheckIcon} />
              ) : (
                <Typography variant="caption" sx={PreparationStepsStyle.stepNumberText}>
                  {index + 1}
                </Typography>
              )}
            </Box>

            <Box
              sx={[
                PreparationStepsStyle.stepContent,
                isChecked ? PreparationStepsStyle.stepContentChecked : false,
              ]}
            >
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
        );
      })}
    </Box>
  );
}
