import type { StrapiList, StrapiData } from "@/types/api";
import type { Page, BlockNode } from "@/types/domain";
import { apiClient } from "../client";

// ─── Internal wire types ───────────────────────────────────────────────────

type StrapiContentPageAttrs = {
  title: string;
  slug: string;
  summary: string | null;
  content: BlockNode[];
  showInFooter: boolean;
  footerSection: string | null;
  footerOrder: number | null;
};

// ─── Mapper ───────────────────────────────────────────────────────────────

function mapPage(raw: StrapiData<StrapiContentPageAttrs>): Page {
  return {
    id: raw.documentId,
    title: raw.title,
    slug: raw.slug,
    summary: raw.summary ?? null,
    content: raw.content ?? [],
    showInFooter: raw.showInFooter ?? false,
    footerSection: raw.footerSection ?? null,
    footerOrder: raw.footerOrder ?? null,
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

export async function getFooterPages(): Promise<Page[]> {
  const raw = await apiClient.get<StrapiList<StrapiContentPageAttrs>>(
    `/content-pages` +
      `?filters[showInFooter][$eq]=true` +
      `&sort=footerOrder:asc` +
      `&pagination[pageSize]=50` +
      `&fields[0]=title&fields[1]=slug&fields[2]=footerSection&fields[3]=footerOrder&fields[4]=showInFooter`
  );
  return raw.data.map((item) => ({
    id: item.documentId,
    title: item.title,
    slug: item.slug,
    summary: null,
    content: [],
    showInFooter: item.showInFooter ?? false,
    footerSection: item.footerSection ?? null,
    footerOrder: item.footerOrder ?? null,
  }));
}
