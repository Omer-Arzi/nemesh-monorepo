import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";
import type { RecipeIngredient } from "@/types/domain";
import { SectionHeader } from "@/components/shared";
import IngredientList from "../IngredientList";
import { IngredientsSectionStyle } from "./styles/IngredientsSectionStyle";

type Props = {
  ingredients: RecipeIngredient[];
  servings?: number | null;
  sx?: SxProps<Theme>;
};

export default function IngredientsSection({ ingredients, servings, sx }: Props) {
  return (
    <section>
      <SectionHeader title="מצרכים" sx={sx} />

      {servings != null && (
        <Typography variant="body2" color="text.secondary" sx={IngredientsSectionStyle.servingsNote}>
          {`ל-${servings} מנות`}
        </Typography>
      )}

      <IngredientList ingredients={ingredients} />
    </section>
  );
}
