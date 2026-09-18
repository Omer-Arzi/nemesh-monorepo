"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";
import type { PreparationSection } from "@/types/domain";
import type { CookingModeStepProps } from "@/features/cooking-mode";
import { SectionHeader } from "@/components/shared";
import { computeSectionStepOffsets } from "@/lib/formatters/stepAnchors";
import PreparationSteps from "../PreparationSteps";
import { PreparationStepsSectionStyle } from "./styles/PreparationStepsSectionStyle";
import { PreparationStepsSectionText } from "./PreparationStepsSection.consts";

type CookingModeBase = Omit<CookingModeStepProps, "sectionIndex">;

type Props = {
  preparationSections: PreparationSection[];
  sx?: SxProps<Theme>;
  cookingMode?: CookingModeBase;
};

export default function PreparationStepsSection({
  preparationSections,
  sx,
  cookingMode,
}: Props) {
  const stepOffsets = computeSectionStepOffsets(preparationSections);

  return (
    <section>
      <SectionHeader title={PreparationStepsSectionText.sectionTitle} sx={sx} />

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
            stepNumberOffset={stepOffsets[i]}
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
