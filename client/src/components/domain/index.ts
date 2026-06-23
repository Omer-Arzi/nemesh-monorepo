/**
 * Domain UI components — know about domain types but perform no data fetching.
 *
 * What belongs here: reusable components that render domain entities (Recipe,
 * Category, etc.) and are used across multiple features.
 *
 * What does NOT belong here: anything that fetches data or is specific to a
 * single feature screen (that belongs in features/<feature>/components/).
 */
export { default as RecipeCard } from "./RecipeCard";
export { default as CategoryChip } from "./CategoryChip";
export { default as IngredientList } from "./IngredientList";
export { default as IngredientSectionList } from "./IngredientSectionList";
export { default as PreparationSteps } from "./PreparationSteps";
export { default as RecipeMeta } from "./RecipeMeta";
export { default as RecipeHero } from "./RecipeHero";
export { default as IngredientsSection } from "./IngredientsSection";
export { default as PreparationStepsSection } from "./PreparationStepsSection";
export { default as RecipeTipsSection } from "./RecipeTipsSection";
export { default as RecipeDetailLayout } from "./RecipeDetailLayout";
export { default as StickyIngredientsSidebar } from "./StickyIngredientsSidebar";
export { default as RelatedRecipes } from "./RelatedRecipes";
export { default as CollectionCard } from "./CollectionCard";
export { RecipeCardSkeleton, RecipeGridSkeleton } from "./RecipeCardSkeleton";
