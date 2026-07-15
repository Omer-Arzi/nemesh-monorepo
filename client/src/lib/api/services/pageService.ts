import type { StrapiList, StrapiData } from "@/types/api";
import type { Page, BlockNode } from "@/types/domain";
import { apiClient } from "../client";

// ─── Internal wire types ───────────────────────────────────────────────────

type StrapiContentPageAttrs = {
  title: string;
  slug: string;
  summary: string | null;
  content: BlockNode[];
};

// ─── Mapper ───────────────────────────────────────────────────────────────

function mapPage(raw: StrapiData<StrapiContentPageAttrs>): Page {
  return {
    id: raw.documentId,
    title: raw.title,
    slug: raw.slug,
    summary: raw.summary ?? null,
    content: raw.content ?? [],
  };
}

// ─── Public API ───────────────────────────────────────────────────────────

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const raw = await apiClient.get<StrapiList<StrapiContentPageAttrs>>(
    `/content-pages?filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[pageSize]=1`
  );
  const first = raw.data[0];
  return first ? mapPage(first) : null;
}

export async function getPageSlugs(): Promise<string[]> {
  const raw = await apiClient.get<StrapiList<{ slug: string }>>(
    `/content-pages?fields[0]=slug&pagination[pageSize]=100`
  );
  return raw.data.map((d) => d.slug);
}
