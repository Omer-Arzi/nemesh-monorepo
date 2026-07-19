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
  /** Call as a function: `ROUTES.RECIPE(slug)` → "/recipes/pasta-bolognese" */
  RECIPE: (slug: string) => `/recipes/${slug}`,
  CATEGORIES: "/categories",
  /** Call as a function: `ROUTES.CATEGORY(slug)` → "/categories/italian" */
  CATEGORY: (slug: string) => `/categories/${slug}`,
  TAGS: "/tags",
  /** Call as a function: `ROUTES.TAG(slug)` → "/tags/quick" */
  TAG: (slug: string) => `/tags/${slug}`,
  SURPRISE_ME: "/surprise-me",
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

