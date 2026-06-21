/**
 * Tag service — public API returns domain types only.
 */
import type { StrapiList, StrapiData } from "@/types/api";
import type { Tag } from "@/types/domain";
import { apiClient } from "../client";
import { mapImage, type StrapiMediaRaw } from "../mappers";

// ─── Internal Strapi wire types ────────────────────────────────────────────

type StrapiTagAttrs = {
  name: string;
  slug: string;
  description: string | null;
  image: StrapiMediaRaw | null;
};

// ─── Mapper ───────────────────────────────────────────────────────────────

function mapTag(raw: StrapiData<StrapiTagAttrs>): Tag {
  return {
    id: raw.documentId,
    name: raw.name,
    slug: raw.slug,
    description: raw.description ?? null,
    image: mapImage(raw.image),
  };
}

// ─── Populate string ──────────────────────────────────────────────────────

const TAG_POPULATE = "populate[image]=true";

// ─── Public API ───────────────────────────────────────────────────────────

/** Fetches all tags, sorted by name. */
export async function getTags(): Promise<Tag[]> {
  const raw = await apiClient.get<StrapiList<StrapiTagAttrs>>(
    `/tags?${TAG_POPULATE}&sort=name:asc&pagination[pageSize]=100`
  );
  return raw.data.map(mapTag);
}

/** Fetches a single tag by slug. Returns null if not found. */
export async function getTagBySlug(slug: string): Promise<Tag | null> {
  const raw = await apiClient.get<StrapiList<StrapiTagAttrs>>(
    `/tags?${TAG_POPULATE}&filters[slug][$eq]=${encodeURIComponent(slug)}`
  );
  const first = raw.data[0];
  return first ? mapTag(first) : null;
}
