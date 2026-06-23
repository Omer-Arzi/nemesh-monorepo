"use client";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import type { SxProps, Theme } from "@mui/material/styles";
import type { RecipeIngredient } from "@/types/domain";
import type { CookingModeIngredientProps } from "@/features/cooking-mode";
import { formatIngredientAmount } from "@/lib/formatters/ingredientAmount";
import { IngredientListStyle } from "./styles/IngredientListStyle";

type Props = {
  ingredients: RecipeIngredient[];
  sx?: SxProps<Theme>;
  cookingMode?: CookingModeIngredientProps;
};

function formatIngredientLine(ingredient: RecipeIngredient): string {
  const parts: string[] = [];

  if (ingredient.amount != null) {
    parts.push(formatIngredientAmount(ingredient.amount));
  }
  if (ingredient.unit) {
    parts.push(ingredient.unit);
  }
  if (ingredient.ingredientName) {
    parts.push(ingredient.ingredientName);
  }

  return parts.join(" ");
}

export default function IngredientList({ ingredients, sx, cookingMode }: Props) {
  if (ingredients.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        אין מרכיבים.
      </Typography>
    );
  }

  const isActive = cookingMode?.isActive ?? false;

  return (
    <List disablePadding sx={sx}>
      {ingredients.map((ingredient, index) => {
        const itemKey = `${cookingMode?.sectionIndex ?? 0}:${index}`;
        const isChecked = isActive && (cookingMode?.checkedKeys.includes(itemKey) ?? false);

        return (
          <ListItem
            key={index}
            disablePadding
            onClick={
              isActive && cookingMode
                ? () => cookingMode.onToggle(itemKey)
                : undefined
            }
            sx={[
              IngredientListStyle.listItem,
              isActive ? IngredientListStyle.listItemClickable : false,
              isChecked ? IngredientListStyle.listItemChecked : false,
            ]}
          >
            {isActive && (
              isChecked ? (
                <CheckCircleOutlineIcon
                  sx={[IngredientListStyle.checkIcon, IngredientListStyle.checkIconDone]}
                />
              ) : (
                <RadioButtonUncheckedIcon
                  sx={[IngredientListStyle.checkIcon, IngredientListStyle.checkIconEmpty]}
                />
              )
            )}

            <Box sx={isChecked ? IngredientListStyle.textChecked : undefined}>
              <Typography variant="body2">{formatIngredientLine(ingredient)}</Typography>
              {ingredient.note && (
                <Typography variant="body2" sx={IngredientListStyle.note}>
                  {ingredient.note}
                </Typography>
              )}
            </Box>
          </ListItem>
        );
      })}
    </List>
  );
}
