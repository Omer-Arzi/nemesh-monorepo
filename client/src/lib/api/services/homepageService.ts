/**
 * Homepage service — fetches static single-type page content.
 *
 * All fields are optional in Strapi. Returns null on fetch/404 failure so
 * the page falls back to hardcoded Hebrew defaults without a loading state.
 *
 * Permissions: enable "find" for homepage in Strapi:
 *   Settings → Users & Permissions → Roles → Public → homepage → find ✓
 */
import type { StrapiSingle, StrapiData } from "@/types/api";
import type {
  HomePage,
  HomepageAbout,
  HomeFeatureCard,
  HomeFeatureSection,
  RecommendedTag,
} from "@/types/domain";
import type { BlockNode } from "@/types/domain";
import { apiClient } from "../client";
import { mapImage, type StrapiMediaRaw } from "../mappers";
import { FEATURE_CARD_KEYS } from "@/constants";

const ILLUSTRATED_CARD_KEYS: readonly string[] = Object.values(FEATURE_CARD_KEYS);

// ─── Internal Strapi wire types ────────────────────────────────────────────

type StrapiAboutSection = {
  id?: number;
  title: string | null;
  body: BlockNode[] | null;
  image: StrapiMediaRaw | null;
};

type StrapiPageRef = {
  slug: string;
  title: string;
};

type StrapiFeatureCard = {
  id?: number;
  cardKey: string | null;
  title: string | null;
  description: string | null;
  icon: StrapiMediaRaw | null;
  cardOrder: number | null;
};

type StrapiFeatureSection = {
  title: string | null;
  cards: StrapiFeatureCard[] | null;
  readMoreLabel: string | null;
  readMorePage: StrapiPageRef | null;
};

// One row of the `recommendedSearchTags` repeatable component. `tag` is a
// required relation in Strapi, but a row could still arrive incomplete via a
// stale populate or a tag deleted after curation — the mapper guards for it.
// `recipes.count` is the published-recipe count (the populate filters to
// publishedAt != null); it is used only to drop zero-count tags — never rendered.
type StrapiRecommendedTagRow = {
  id?: number;
  tag: {
    name: string | null;
    slug: string | null;
    recipes: { count: number } | null;
  } | null;
};

type StrapiHomepageAttrs = {
  heroTitle: string | null;
  heroSubtitle: string | null;
  heroBackgroundImage: StrapiMediaRaw | null;
  latestRecipesTitle: string | null;
  featuredCategoriesTitle: string | null;
  about: StrapiAboutSection | null;
  featureSection: StrapiFeatureSection | null;
  recommendedSearchTags: StrapiRecommendedTagRow[] | null;
};

/** Hard cap — mirrors the Strapi component `max`; defensive against a bad payload. */
const MAX_RECOMMENDED_TAGS = 5;

// ─── Mappers ──────────────────────────────────────────────────────────────

function mapAbout(raw: StrapiAboutSection | null | undefined): HomepageAbout | null {
  if (!raw) return null;
  const image = mapImage(raw.image);
  if (!image) return null;
  return {
    title: raw.title?.trim() || null,
    body: raw.body ?? [],
    image,
  };
}

// Requires a title always, and an icon UNLESS the card's key matches one of
// the illustrations built into the frontend — a card failing both is
// dropped rather than shown broken.
function mapFeatureCard(raw: StrapiFeatureCard): HomeFeatureCard | null {
  const title = raw.title?.trim();
  if (!title) return null;
  const key = raw.cardKey?.trim() || title;
  const icon = mapImage(raw.icon);
  if (!icon && !ILLUSTRATED_CARD_KEYS.includes(key)) return null;
  return {
    key,
    title,
    description: raw.description?.trim() || null,
    icon,
    order: raw.cardOrder ?? null,
  };
}

function mapFeatureSection(raw: StrapiFeatureSection | null | undefined): HomeFeatureSection | null {
  if (!raw) return null;
  const cards = (raw.cards ?? [])
    .map(mapFeatureCard)
    .map((card, index) => (card ? { card, sortKey: card.order ?? index } : null))
    .filter((entry): entry is { card: HomeFeatureCard; sortKey: number } => entry !== null)
    .sort((a, b) => a.sortKey - b.sortKey)
    .map((entry) => entry.card);

  if (cards.length === 0) return null;

  return {
    title: raw.title?.trim() || null,
    cards,
    readMoreLabel: raw.readMoreLabel?.trim() || null,
    readMorePage: raw.readMorePage ? { slug: raw.readMorePage.slug, title: raw.readMorePage.title } : null,
  };
}

// Keeps editor row order. Drops rows whose tag is missing, unnamed, unslugged,
// or has zero published recipes (D1). Caps at 5 (D2) as a defensive measure —
// Strapi already enforces the cap on save.
function mapRecommendedTags(raw: StrapiRecommendedTagRow[] | null | undefined): RecommendedTag[] {
  if (!raw) return [];
  return raw
    .map((row) => row.tag)
    .filter((tag): tag is NonNullable<StrapiRecommendedTagRow["tag"]> => tag !== null)
    .map((tag) => ({
      name: tag.name?.trim() ?? "",
      slug: tag.slug?.trim() ?? "",
      publishedRecipeCount: tag.recipes?.count ?? 0,
    }))
    .filter((tag) => tag.name !== "" && tag.slug !== "" && tag.publishedRecipeCount >= 1)
    .slice(0, MAX_RECOMMENDED_TAGS)
    .map((tag) => ({ name: tag.name, slug: tag.slug }));
}

function mapHomepage(raw: StrapiData<StrapiHomepageAttrs>): HomePage {
  return {
    heroTitle: raw.heroTitle ?? null,
    heroSubtitle: raw.heroSubtitle ?? null,
    heroBackgroundImage: mapImage(raw.heroBackgroundImage),
    latestRecipesTitle: raw.latestRecipesTitle ?? null,
    featuredCategoriesTitle: raw.featuredCategoriesTitle ?? null,
    about: mapAbout(raw.about),
    featureSection: mapFeatureSection(raw.featureSection),
    recommendedTags: mapRecommendedTags(raw.recommendedSearchTags),
  };
}

// ─── Populate ─────────────────────────────────────────────────────────────

const HOMEPAGE_POPULATE =
  "populate[heroBackgroundImage]=true" +
  "&populate[about][populate][image]=true" +
  "&populate[featureSection][populate][cards][populate][icon]=true" +
  "&populate[featureSection][populate][readMorePage][fields][0]=slug" +
  "&populate[featureSection][populate][readMorePage][fields][1]=title" +
  // Curated hero-search recommendations. Row order is authoritative. Each tag
  // carries its published-recipe count (relation filtered to publishedAt != null
  // so drafts never inflate it) used only to drop zero-count tags client-side.
  "&populate[recommendedSearchTags][populate][tag][fields][0]=name" +
  "&populate[recommendedSearchTags][populate][tag][fields][1]=slug" +
  "&populate[recommendedSearchTags][populate][tag][populate][recipes][count]=true" +
  "&populate[recommendedSearchTags][populate][tag][populate][recipes][filters][publishedAt][%24notNull]=true";

// ─── Public API ───────────────────────────────────────────────────────────

export async function getHomepage(): Promise<HomePage | null> {
  try {
    const raw = await apiClient.get<StrapiSingle<StrapiHomepageAttrs>>(`/homepage?${HOMEPAGE_POPULATE}`);
    return mapHomepage(raw.data);
  } catch (err) {
    const apiErr = err as { status?: number };
    if (apiErr?.status === 404) return null;
    throw err;
  }
}
