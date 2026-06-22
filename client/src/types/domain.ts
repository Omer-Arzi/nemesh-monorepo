/**
 * Domain model types — the canonical shapes used throughout the application.
 *
 * Import these in components, hooks, features, and stores.
 * Do NOT import from src/types/api.ts outside of src/lib/api/.
 *
 * Derived from the Strapi content model in /server/src/api/.
 * `id` maps to Strapi's `documentId` (the stable string identifier).
 */

/** Every persisted entity has a stable string identifier. */
export type BaseEntity = {
  id: string; // maps to Strapi's documentId
};

/** Resolved image with display metadata. */
export type Image = {
  url: string;
  alt: string;
  width: number;
  height: number;
};

/** Recipe difficulty levels — mirrors the server enum. */
export type Difficulty = "easy" | "medium" | "hard";

// ─── Component types (not standalone entities) ────────────────────────────

/** A single ingredient line within a recipe. */
export type RecipeIngredient = {
  ingredientName: string | null;
  amount: number | null;
  unit: string | null;
  note: string | null;
};

/** A single preparation step within a recipe. */
export type PreparationStep = {
  description: string;
  image: Image | null;
};

/** A single tip attached to a recipe. */
export type RecipeTip = {
  text: string;
};

/**
 * A named preparation section containing its own ordered steps.
 * Used when a recipe has multiple distinct preparation phases
 * (e.g. "לקציפה", "לאספרגוס", "לרוטב").
 */
export type PreparationSection = {
  title: string | null;
  steps: PreparationStep[];
};

// ─── Collection types ─────────────────────────────────────────────────────

/** Content category for primary recipe navigation. */
export type Category = BaseEntity & {
  name: string;
  menuName: string | null;
  slug: string;
  description: string | null;
  image: Image | null;
};

/** Secondary descriptor tag — context, collection, or dietary attribute. */
export type Tag = BaseEntity & {
  name: string;
  slug: string;
  description: string | null;
  image: Image | null;
};

/**
 * Full recipe entity — all fields populated.
 * Used on recipe detail pages.
 */
export type Recipe = BaseEntity & {
  title: string;
  slug: string;
  image: Image | null;
  categories: Category[];
  tags: Tag[];
  servings: number | null;
  prepTime: number | null;
  difficulty: Difficulty | null;
  description: string | null;
  ingredients: RecipeIngredient[];
  /** Legacy flat steps — populated for recipes created before preparationSections. */
  steps: PreparationStep[];
  /** Grouped preparation sections — preferred over steps for new recipes. */
  preparationSections: PreparationSection[];
  tips: RecipeTip[];
  createdAt: string; // ISO 8601
  updatedAt: string;
};

/**
 * Partial recipe returned by the search endpoint.
 * Only listing-relevant fields are populated.
 */
export type RecipeSummary = Pick<
  Recipe,
  "id" | "title" | "slug" | "image" | "categories" | "tags" | "difficulty" | "prepTime" | "servings"
>;

/**
 * Canonical ingredient entry in the shared ingredient vocabulary.
 * Source of truth for normalised ingredient names.
 */
export type IngredientCatalogItem = BaseEntity & {
  canonicalName: string;
  slug: string;
  variants: string[] | null;
  approvalStatus: "approved" | "pending";
  notes: string | null;
};
