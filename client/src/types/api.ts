/**
 * API transport layer types — Strapi v5 wire format and generic transport utilities.
 *
 * ISOLATION RULE: These types must NOT be imported outside of src/lib/api/.
 * Components, hooks, and feature code must import from src/types/domain.ts only.
 * Services consume these types internally and map to domain types before returning.
 *
 * Strapi v5 wire format differs from v4:
 *  - The `attributes` wrapper was removed; entity fields sit directly on the object.
 *  - `id` (DB sequence integer) is still present but `documentId` (stable string UUID)
 *    is the primary identifier used for all CRUD operations and stable across envs.
 */

/** Normalised error shape thrown by apiClient. */
export type ApiError = {
  status: number;
  message: string;
  details?: unknown;
};

/**
 * Strapi v5 flat entity wrapper.
 *
 * T contains the entity's own fields.
 * `id` is the DB sequence (not stable); prefer `documentId` for references.
 * `documentId` is the stable string identifier (UUID-like) used in all API calls.
 */
export type StrapiData<T> = { id: number; documentId: string } & T;

/** Strapi v5 response envelope for a single entity. */
export type StrapiSingle<T> = {
  data: StrapiData<T>;
  meta: Record<string, unknown>;
};

/** Strapi v5 response envelope for a paginated list. */
export type StrapiList<T> = {
  data: StrapiData<T>[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
};

/** Generic paginated query params accepted by list endpoints. */
export type PaginationParams = {
  page?: number;
  pageSize?: number;
};
