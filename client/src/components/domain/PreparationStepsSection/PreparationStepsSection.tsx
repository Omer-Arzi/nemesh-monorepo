"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";
import type { PreparationSection } from "@/types/domain";
import { SectionHeader } from "@/components/shared";
import PreparationSteps from "../PreparationSteps";
import { PreparationStepsSectionStyle } from "./styles/PreparationStepsSectionStyle";

type Props = {
  preparationSections: PreparationSection[];
  sx?: SxProps<Theme>;
};

export default function PreparationStepsSection({
  preparationSections,
  sx,
}: Props) {
  return (
    <section>
      <SectionHeader title="אופן הכנה" sx={sx} />

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
          <PreparationSteps steps={section.steps} />
        </Box>
      ))}
    </section>
  );
}
