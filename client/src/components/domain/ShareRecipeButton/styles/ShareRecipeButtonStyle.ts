import { PrintRecipeButtonStyle } from "../../PrintRecipeButton/styles/PrintRecipeButtonStyle";

export const ShareRecipeButtonStyle = {
  // Identical to the print control it stands in for on phones — same pill,
  // same 44px touch target — so the recipe hero does not change.
  root: PrintRecipeButtonStyle.root,
  progress: {
    color: "inherit",
  },
} as const;
