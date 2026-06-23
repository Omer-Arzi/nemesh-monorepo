/** Persisted per-recipe state. Key scheme: "nemesh:v1:cooking-mode:<recipeId>" */
export type CookingModeState = {
  recipeId: string;
  /** Keys are "sectionIndex:ingredientIndex" */
  checkedIngredientKeys: string[];
  /** Keys are "sectionIndex:stepIndex" */
  checkedStepKeys: string[];
  updatedAt: number;
};

export type CookingModeIngredientProps = {
  isActive: boolean;
  /** Full keys: "sectionIndex:ingredientIndex" */
  checkedKeys: string[];
  sectionIndex: number;
  onToggle: (key: string) => void;
};

export type CookingModeStepProps = {
  isActive: boolean;
  /** Full keys: "sectionIndex:stepIndex" */
  checkedKeys: string[];
  sectionIndex: number;
  onToggle: (key: string) => void;
};
