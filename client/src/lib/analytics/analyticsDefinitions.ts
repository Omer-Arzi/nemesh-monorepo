/*
 * Analytics definitions — the single source of truth for all GA4 event names
 * and parameter names used in this project.
 *
 * When adding a new event or parameter:
 *   1. Add its name here first.
 *   2. Add the corresponding parameter type to Ga4AnalyticsAdapter.ts.
 *   3. Add the tracking method to Ga4AnalyticsAdapter.ts using these constants.
 *   4. Register any new custom dimensions in GA4 > Admin > Custom definitions.
 *
 * Never write raw GA4 event-name or parameter-name strings anywhere else in the codebase.
 */

export const AnalyticsEvents = {
  pageView: "page_view",
  recipeView: "view_recipe",
  categoryView: "view_category",
  cookingModeStart: "cooking_mode_start",
  cookingModeExit: "cooking_mode_exit",
} as const;

export const AnalyticsParams = {
  pageId: "page_id",
  pageName: "page_name",
  pagePath: "page_path",
  recipeId: "recipe_id",
  recipeName: "recipe_name",
  recipeSlug: "recipe_slug",
  categoryId: "category_id",
  categoryName: "category_name",
  categorySlug: "category_slug",
} as const;
