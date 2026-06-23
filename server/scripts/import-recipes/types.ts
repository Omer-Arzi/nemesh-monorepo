export type NormalizedIngredient = {
  ingredientName: string;
  amount: number | null;
  unit: string | null;
  note: string | null;
};

export type NormalizedIngredientSection = {
  title: string | null;
  ingredients: NormalizedIngredient[];
};

export type NormalizedStep = {
  description: string;
};

export type NormalizedPreparationSection = {
  title: string | null;
  steps: NormalizedStep[];
};

export type NormalizedTip = {
  text: string;
};

export type Difficulty = "easy" | "medium" | "hard";

/**
 * Shape produced by Claude Code normalization — no slug yet.
 *
 * Ingredient fields (in order of preference):
 *   `ingredientSections` — grouped ingredient sections with optional titles.
 *   `ingredients`        — legacy flat list; auto-converted to a single unnamed section.
 *
 * Preparation fields (in order of preference):
 *   `preparationSections` — grouped preparation sections with optional titles.
 *   `steps`               — legacy flat list; auto-converted to a single unnamed section.
 */
export type LLMRecipeOutput = {
  title: string;
  description: string | null;
  servings: number | null;
  prepTime: number | null;
  difficulty: Difficulty | null;
  /** Preferred — one or more named or unnamed ingredient sections. */
  ingredientSections?: NormalizedIngredientSection[];
  /** Legacy flat ingredient list — auto-converted to ingredientSections before import. */
  ingredients?: NormalizedIngredient[];
  /** Legacy flat steps — accepted but converted to preparationSections before import. */
  steps?: NormalizedStep[];
  /** Preferred — one or more named or unnamed preparation sections. */
  preparationSections?: NormalizedPreparationSection[];
  tips: NormalizedTip[];
  categories: [];
  tags: [];
};

/** Fully normalized recipe with slug, resolved ingredientSections and preparationSections — ready for Strapi. */
export type NormalizedRecipe = Omit<
  LLMRecipeOutput,
  "steps" | "preparationSections" | "ingredients" | "ingredientSections"
> & {
  slug: string;
  ingredientSections: NormalizedIngredientSection[];
  preparationSections: NormalizedPreparationSection[];
};

export type ImportStatus = "created" | "skipped" | "failed";

export type ImportResult = {
  recipe: NormalizedRecipe;
  status: ImportStatus;
  error?: string;
};
