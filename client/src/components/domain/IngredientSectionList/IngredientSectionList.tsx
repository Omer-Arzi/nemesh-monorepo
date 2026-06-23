"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";
import type { IngredientSection } from "@/types/domain";
import type { CookingModeIngredientProps } from "@/features/cooking-mode";
import IngredientList from "../IngredientList";
import { IngredientSectionListStyle } from "./styles/IngredientSectionListStyle";

type CookingModeBase = Omit<CookingModeIngredientProps, "sectionIndex">;

type Props = {
  sections: IngredientSection[];
  sx?: SxProps<Theme>;
  cookingMode?: CookingModeBase;
};

/**
 * Renders a list of ingredient sections.
 *
 * - Single unnamed section: renders as a plain IngredientList (no title).
 * - Multiple sections or named section: renders each title + its IngredientList.
 */
export default function IngredientSectionList({ sections, sx, cookingMode }: Props) {
  if (sections.length === 0) return null;

  // Single unnamed section — skip the title wrapper entirely.
  if (sections.length === 1 && !sections[0].title) {
    return (
      <IngredientList
        ingredients={sections[0].ingredients}
        sx={sx}
        cookingMode={cookingMode ? { ...cookingMode, sectionIndex: 0 } : undefined}
      />
    );
  }

  return (
    <Box sx={sx}>
      {sections.map((section, i) => (
        <Box key={i}>
          {section.title && (
            <Typography
              variant="subtitle2"
              sx={{
                ...IngredientSectionListStyle.sectionTitle,
                ...(i === 0 ? { mt: 0 } : {}),
              }}
            >
              {section.title}
            </Typography>
          )}
          <IngredientList
            ingredients={section.ingredients}
            cookingMode={cookingMode ? { ...cookingMode, sectionIndex: i } : undefined}
          />
        </Box>
      ))}
    </Box>
  );
}
