/**
 * Shared mapping utilities for the API layer.
 *
 * Translates Strapi wire-format values to domain types.
 * MUST NOT be imported outside of src/lib/api/.
 * Callers outside the API layer receive domain types from service functions.
 */
import type { Image } from "@/types/domain";

/** Strapi v5 media object shape as returned by the REST API. */
export type StrapiMediaRaw = {
  id: number;
  documentId: string;
  url: string;
  alternativeText: string | null;
  width: number | null;
  height: number | null;
};

/** Maps a Strapi media object to the domain Image type. Returns null if absent. */
export function mapImage(raw: StrapiMediaRaw | null | undefined): Image | null {
  if (!raw) return null;
  return {
    url: raw.url,
    alt: raw.alternativeText ?? "",
    width: raw.width ?? 0,
    height: raw.height ?? 0,
  };
}
