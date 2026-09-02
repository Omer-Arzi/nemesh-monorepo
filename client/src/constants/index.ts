/**
 * Application-wide constants.
 *
 * What belongs here: route paths, default pagination sizes, local-storage
 * keys, feature flag names, date format strings.
 *
 * What does NOT belong here: environment-specific values (those live in
 * lib/api/config.ts or .env files) or component styling constants (use the
 * MUI theme tokens instead).
 */

export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  /** Recipe listing / results page. */
  RESULTS: "/results",
  /**
   * Results page pre-filtered to one tag, by slug.
   * `ROUTES.RESULTS_BY_TAG("quick")` → "/results?tag=quick"
   */
  RESULTS_BY_TAG: (slug: string) => `/results?tag=${encodeURIComponent(slug)}`,
  /** Call as a function: `ROUTES.RECIPE(slug)` → "/recipes/pasta-bolognese" */
  RECIPE: (slug: string) => `/recipes/${slug}`,
  CATEGORIES: "/categories",
  /** Call as a function: `ROUTES.CATEGORY(slug)` → "/categories/italian" */
  CATEGORY: (slug: string) => `/categories/${slug}`,
  /** Call as a function: `ROUTES.TAG(slug)` → "/tags/quick" */
  TAG: (slug: string) => `/tags/${slug}`,
  SURPRISE_ME: "/surprise-me",
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * The three homepage feature-card `cardKey` values that have a hand-authored
 * illustration built into the frontend (src/assets/illustrations/). A card
 * using one of these keys doesn't need a Strapi `icon` upload to be valid —
 * see homepageService.ts's mapFeatureCard and FeatureSection.consts.ts.
 */
export const FEATURE_CARD_KEYS = {
  INGREDIENTS_AVAILABLE: "ingredients-available",
  COOKING_MODE: "cooking-mode",
  SEARCH_BY_INGREDIENTS: "search-by-ingredients",
} as const;

