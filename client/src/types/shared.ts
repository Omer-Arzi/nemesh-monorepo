/**
 * Cross-cutting utility types used throughout the application.
 *
 * What belongs here: generic TypeScript utilities that do not belong to any
 * specific domain — Nullable, Maybe, AsyncState, PaginatedResult, etc.
 *
 * What does NOT belong here: domain-specific types, API/Strapi types, or
 * component prop types (those live next to their component).
 */

/** Makes a type nullable. */
export type Nullable<T> = T | null;

/** Makes a type nullable and undefineable. */
export type Maybe<T> = T | null | undefined;

/** Discriminated union for representing async operation state. */
export type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: unknown };

/** Common React prop additions. */
export type PropsWithClassName<P = object> = P & {
  className?: string;
};

/** Make specific keys required on an otherwise partial type. */
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Paginated list of any domain entity, returned by list service functions.
 *
 * Services map Strapi's pagination envelope to this shape so callers never
 * touch Strapi-specific meta objects.
 */
export type PaginatedResult<T> = {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
};
