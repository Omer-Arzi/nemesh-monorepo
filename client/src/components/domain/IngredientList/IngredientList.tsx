"use client";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";
import type { RecipeIngredient } from "@/types/domain";
import { formatIngredientAmount } from "@/lib/formatters/ingredientAmount";
import { IngredientListStyle } from "./styles/IngredientListStyle";

type Props = {
  ingredients: RecipeIngredient[];
  sx?: SxProps<Theme>;
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

export default function IngredientList({ ingredients, sx }: Props) {
  if (ingredients.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        אין מרכיבים.
      </Typography>
    );
  }

  return (
    <List disablePadding sx={sx}>
      {ingredients.map((ingredient, index) => (
        <ListItem key={index} disablePadding sx={IngredientListStyle.listItem}>
          <Typography variant="body2">{formatIngredientLine(ingredient)}</Typography>
          {ingredient.note && (
            <Typography variant="body2" sx={IngredientListStyle.note}>
              {ingredient.note}
            </Typography>
          )}
        </ListItem>
      ))}
    </List>
  );
}
