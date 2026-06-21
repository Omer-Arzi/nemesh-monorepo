/**
 * Category service — public API returns domain types only.
 */
import type { StrapiList, StrapiData } from "@/types/api";
import type { Category } from "@/types/domain";
import { apiClient } from "../client";
import { mapImage, type StrapiMediaRaw } from "../mappers";

// ─── Internal Strapi wire types ────────────────────────────────────────────

type StrapiCategoryAttrs = {
  name: string;
  menuName: string | null;
  slug: string;
  description: string | null;
  image: StrapiMediaRaw | null;
};

// ─── Mapper ───────────────────────────────────────────────────────────────

function mapCategory(raw: StrapiData<StrapiCategoryAttrs>): Category {
  return {
    id: raw.documentId,
    name: raw.name,
    menuName: raw.menuName ?? null,
    slug: raw.slug,
    description: raw.description ?? null,
    image: mapImage(raw.image),
  };
}

// ─── Populate string ──────────────────────────────────────────────────────

const CATEGORY_POPULATE = "populate[image]=true";

// ─── Public API ───────────────────────────────────────────────────────────

/** Fetches all categories, sorted by name. */
export async function getCategories(): Promise<Category[]> {
  const raw = await apiClient.get<StrapiList<StrapiCategoryAttrs>>(
    `/categories?${CATEGORY_POPULATE}&sort=name:asc&pagination[pageSize]=100`
  );
  return raw.data.map(mapCategory);
}

/** Fetches a single category by slug. Returns null if not found. */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const raw = await apiClient.get<StrapiList<StrapiCategoryAttrs>>(
    `/categories?${CATEGORY_POPULATE}&filters[slug][$eq]=${encodeURIComponent(slug)}`
  );
  const first = raw.data[0];
  return first ? mapCategory(first) : null;
}
