import type { StrapiSingle } from "@/types/api";
import type { FooterData, FooterSection, FooterLink } from "@/types/domain";
import { apiClient } from "../client";

// ─── Internal wire types ───────────────────────────────────────────────────

type StrapiPageRef = {
  slug: string;
  title: string;
};

type StrapiFooterLinkRaw = {
  customLabel: string | null;
  page: StrapiPageRef | null;
  externalUrl: string | null;
  openInNewTab: boolean;
};

type StrapiFooterSectionRaw = {
  title: string;
  links: StrapiFooterLinkRaw[];
};

type StrapiFooterAttrs = {
  sections: StrapiFooterSectionRaw[];
  copyrightText: string | null;
};

// ─── Mappers ──────────────────────────────────────────────────────────────

function mapFooterLink(raw: StrapiFooterLinkRaw): FooterLink {
  return {
    customLabel: raw.customLabel ?? null,
    page: raw.page ? { slug: raw.page.slug, title: raw.page.title } : null,
    externalUrl: raw.externalUrl ?? null,
    openInNewTab: raw.openInNewTab ?? false,
  };
}

function mapFooterSection(raw: StrapiFooterSectionRaw): FooterSection {
  return {
    title: raw.title,
    links: (raw.links ?? []).map(mapFooterLink),
  };
}

// ─── Populate ─────────────────────────────────────────────────────────────

// Populate links.page with slug + title so frontend can use page.title as fallback label.
const FOOTER_POPULATE =
  "populate[sections][populate][links][populate][page][fields][0]=slug" +
  "&populate[sections][populate][links][populate][page][fields][1]=title";

// ─── Public API ───────────────────────────────────────────────────────────

export async function getFooter(): Promise<FooterData | null> {
  try {
    const raw = await apiClient.get<StrapiSingle<StrapiFooterAttrs>>(
      `/footer?${FOOTER_POPULATE}`
    );
    return {
      sections: (raw.data.sections ?? []).map(mapFooterSection),
      copyrightText: raw.data.copyrightText ?? null,
    };
  } catch {
    return null;
  }
}
