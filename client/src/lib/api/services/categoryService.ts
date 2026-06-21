/**
 * Category service — public API returns domain types only.
 */
import type { StrapiList, StrapiData } from "@/types/api";
import type { Category } from "@/types/domain";
import { apiClient } from "../client";

// ─── Internal Strapi wire types ────────────────────────────────────────────

type StrapiCategoryAttrs = {
  name: string;
  slug: string;
  description: string | null;
};

// ─── Mapper ───────────────────────────────────────────────────────────────

function mapCategory(raw: StrapiData<StrapiCategoryAttrs>): Category {
  return {
    id: raw.documentId,
    name: raw.name,
    slug: raw.slug,
    description: raw.description ?? null,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────

/** Fetches all categories, sorted by name. */
export async function getCategories(): Promise<Category[]> {
  const raw = await apiClient.get<StrapiList<StrapiCategoryAttrs>>(
    "/categories?sort=name:asc&pagination[pageSize]=100"
  );
  return raw.data.map(mapCategory);
}
