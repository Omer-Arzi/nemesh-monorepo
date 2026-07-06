/**
 * Centralised TanStack Query cache key registry.
 *
 * Why here: co-locating all keys prevents accidental collisions across features,
 * and makes cache invalidation predictable — callers invalidate by importing a
 * key factory rather than reconstructing strings manually.
 *
 * Convention: each namespace has an `all` root key (for bulk invalidation) plus
 * specific factory functions for filtered or parameterised queries.
 *
 * What belongs here: every query key in the application.
 * What does NOT belong here: fetcher functions or query option objects — those
 * live in feature hook files.
 */
import type { PaginationParams } from "@/types/api";

export const queryKeys = {
  recipes: {
    /** Invalidate to clear all recipe queries at once. */
    all: () => ["recipes"] as const,
    /** Paginated list with optional params (page, pageSize). */
    list: (params?: PaginationParams) => ["recipes", "list", params] as const,
    /** Single recipe by slug. */
    detail: (slug: string) => ["recipes", "detail", slug] as const,
    /** Full-text search results for a query string. */
    search: (q: string) => ["recipes", "search", q] as const,
    /** Ingredient-intent search — recipes that actually contain this ingredient. */
    byIngredient: (ingredient: string) => ["recipes", "byIngredient", ingredient] as const,
    /** Related recipes for a given slug (server-scored, deterministic). */
    related: (slug: string) => ["recipes", "related", slug] as const,
    /** Recipes filtered by category slug. */
    byCategory: (slug: string) => ["recipes", "byCategory", slug] as const,
    /** Recipes filtered by tag slug. */
    byTag: (slug: string) => ["recipes", "byTag", slug] as const,
    /** Latest recipes sorted by createdAt descending (homepage section). */
    latest: () => ["recipes", "latest"] as const,
    /**
     * Infinite scroll listing (Results page).
     * Kept separate from list() — infinite queries accumulate pages across the
     * whole session and must not share a cache entry with one-shot paginated calls.
     */
    infinite: () => ["recipes", "infinite"] as const,
  },

  categories: {
    /** Invalidate to clear all category queries at once. */
    all: () => ["categories"] as const,
    /** Full list (categories are typically fetched all at once). */
    list: () => ["categories", "list"] as const,
    /** Single category by slug. */
    detail: (slug: string) => ["categories", "detail", slug] as const,
  },

  tags: {
    /** Invalidate to clear all tag queries at once. */
    all: () => ["tags"] as const,
    /** Full list. */
    list: () => ["tags", "list"] as const,
    /** Single tag by slug. */
    detail: (slug: string) => ["tags", "detail", slug] as const,
  },

  shirChallengePage: {
    /** Invalidate to clear the single type cache. */
    all: () => ["shirChallengePage"] as const,
    /** The single shir-challenge-page document. */
    detail: () => ["shirChallengePage", "detail"] as const,
  },

  shirChallengeMonth: {
    /** Invalidate to clear all monthly challenge queries. */
    all: () => ["shirChallengeMonth"] as const,
    /** Current month record, keyed by YYYY-MM so it re-fetches on month rollover. */
    current: (monthKey: string) => ["shirChallengeMonth", "current", monthKey] as const,
    /** Previous month record, keyed by the current month's start date. */
    previous: (currentMonthStart: string) =>
      ["shirChallengeMonth", "previous", currentMonthStart] as const,
  },
  suggestions: {
    all: () => ["suggestions"] as const,
    byQuery: (q: string) => ["suggestions", "byQuery", q] as const,
  },

  pages: {
    all: () => ["pages"] as const,
    detail: (slug: string) => ["pages", "detail", slug] as const,
    slugs: () => ["pages", "slugs"] as const,
    footerPages: () => ["pages", "footer"] as const,
  },

  footer: {
    all: () => ["footer"] as const,
    detail: () => ["footer", "detail"] as const,
  },
} as const;
