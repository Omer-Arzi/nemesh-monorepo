/**
 * Public types barrel.
 *
 * Intentionally does NOT re-export src/types/api.ts.
 * Strapi wire types are internal to src/lib/api/ — import them there directly.
 * Everything else in the application imports from here or from domain.ts / shared.ts.
 */
export type * from "./domain";
export type * from "./shared";
