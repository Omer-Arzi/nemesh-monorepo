"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import type { SxProps, Theme } from "@mui/material/styles";
import type { PreparationSection } from "@/types/domain";
import type { CookingModeStepProps } from "@/features/cooking-mode";
import { SectionHeader } from "@/components/shared";
import PreparationSteps from "../PreparationSteps";
import { PreparationStepsSectionStyle } from "./styles/PreparationStepsSectionStyle";

type CookingModeBase = Omit<CookingModeStepProps, "sectionIndex">;

type Props = {
  preparationSections: PreparationSection[];
  sx?: SxProps<Theme>;
  cookingMode?: CookingModeBase & {
    stepProgress: { checked: number; total: number };
    reset: () => void;
  };
};

export default function PreparationStepsSection({
  preparationSections,
  sx,
  cookingMode,
}: Props) {
  return (
    <section>
      <Box sx={PreparationStepsSectionStyle.sectionHeaderRow}>
        <SectionHeader title="אופן הכנה" sx={sx} />
        <Box sx={PreparationStepsSectionStyle.sectionHeaderActions}>
          {cookingMode?.isActive && cookingMode.stepProgress.total > 0 && (
            <Chip
              label={`${cookingMode.stepProgress.checked} מתוך ${cookingMode.stepProgress.total} שלבים`}
              size="small"
              color="success"
              variant="outlined"
              sx={PreparationStepsSectionStyle.progressChip}
            />
          )}
          {cookingMode?.isActive && (
            <Button
              size="small"
              variant="text"
              color="inherit"
              onClick={cookingMode.reset}
              sx={PreparationStepsSectionStyle.resetButton}
            >
              איפוס סימונים
            </Button>
          )}
        </Box>
      </Box>

      {preparationSections.map((section, i) => (
        <Box key={i} sx={PreparationStepsSectionStyle.sectionGroup}>
          {section.title && (
            <Typography
              variant="subtitle1"
              component="h3"
              sx={PreparationStepsSectionStyle.sectionTitle}
            >
              {section.title}
            </Typography>
          )}
          <PreparationSteps
            steps={section.steps}
            cookingMode={
              cookingMode
                ? {
                    isActive: cookingMode.isActive,
                    checkedKeys: cookingMode.checkedKeys,
                    onToggle: cookingMode.onToggle,
                    sectionIndex: i,
                  }
                : undefined
            }
          />
        </Box>
      ))}
    </section>
  );
}
