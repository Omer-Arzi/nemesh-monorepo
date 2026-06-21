import type { SxProps, Theme } from "@mui/material/styles";
import type { PreparationStep } from "@/types/domain";
import { SectionHeader } from "@/components/shared";
import PreparationSteps from "../PreparationSteps";

type Props = {
  steps: PreparationStep[];
  sx?: SxProps<Theme>;
};

export default function PreparationStepsSection({ steps, sx }: Props) {
  return (
    <section>
      <SectionHeader title="אופן הכנה" sx={sx} />
      <PreparationSteps steps={steps} />
    </section>
  );
}
