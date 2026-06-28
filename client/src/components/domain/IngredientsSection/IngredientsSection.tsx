import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";
import type { IngredientSection, RecipeIngredient } from "@/types/domain";
import { SectionHeader } from "@/components/shared";
import IngredientList from "../IngredientList";
import IngredientSectionList from "../IngredientSectionList";
import { IngredientsSectionStyle } from "./styles/IngredientsSectionStyle";

type Props = {
  ingredientSections?: IngredientSection[];
  ingredients?: RecipeIngredient[];
  servings?: number | null;
  sx?: SxProps<Theme>;
};

export default function IngredientsSection({
  ingredientSections,
  ingredients = [],
  servings,
  sx,
}: Props) {
  const hasSections = ingredientSections && ingredientSections.length > 0;

  return (
    <section>
      <SectionHeader title="מצרכים" sx={sx} />

      {servings != null && (
        <Typography variant="body2" color="text.secondary" sx={IngredientsSectionStyle.servingsNote}>
          {`ל-${servings} מנות`}
        </Typography>
      )}

      {hasSections ? (
        <IngredientSectionList sections={ingredientSections} />
      ) : (
        <IngredientList ingredients={ingredients} />
      )}
    </section>
  );
}
