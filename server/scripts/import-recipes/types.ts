export type NormalizedIngredient = {
  ingredientName: string;
  amount: number | null;
  unit: string | null;
  note: string | null;
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
 * `preparationSections` is the preferred field.
 * `steps` is accepted for backward compatibility with manually authored JSON;
 * the pipeline converts it to a single unnamed section before importing.
 */
export type LLMRecipeOutput = {
  title: string;
  description: string | null;
  servings: number | null;
  prepTime: number | null;
  difficulty: Difficulty | null;
  ingredients: NormalizedIngredient[];
  /** Legacy flat steps — accepted but converted to preparationSections before import. */
  steps?: NormalizedStep[];
  /** Preferred — one or more named or unnamed preparation sections. */
  preparationSections?: NormalizedPreparationSection[];
  tips: NormalizedTip[];
  categories: [];
  tags: [];
};

/** Fully normalized recipe with slug and resolved preparationSections — ready for Strapi. */
export type NormalizedRecipe = Omit<LLMRecipeOutput, "steps" | "preparationSections"> & {
  slug: string;
  preparationSections: NormalizedPreparationSection[];
};

export type ImportStatus = "created" | "skipped" | "failed";

export type ImportResult = {
  recipe: NormalizedRecipe;
  status: ImportStatus;
  error?: string;
};
