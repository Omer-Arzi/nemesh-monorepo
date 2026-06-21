/**
 * Public surface of the API module.
 *
 * Service functions return domain types; callers never touch Strapi shapes.
 * Strapi types (StrapiData, StrapiList, etc.) are intentionally not re-exported
 * here — they live in src/types/api.ts and are consumed only within this module.
 */
export { apiClient } from "./client";
export { API_CONFIG } from "./config";
export * from "./services";
