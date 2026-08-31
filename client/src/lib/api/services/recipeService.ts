/**
 * Recipe service — public API returns domain types only.
 *
 * Internal Strapi wire types and mapper functions are private to this file.
 * Nothing above this layer should need to know about StrapiData or documentId.
 */
import type { StrapiList, StrapiData, PaginationParams } from "@/types/api";
import type {
  Recipe,
  RecipeSummary,
  Category,
  Tag,
  RecipeIngredient,
  IngredientSection,
  PreparationStep,
  PreparationSection,
  RecipeTip,
  SpecialEquipmentItem,
  Difficulty,
} from "@/types/domain";
import type { PaginatedResult } from "@/types/shared";
import { apiClient } from "../client";
import { mapImage, type StrapiMediaRaw } from "../mappers";

// ─── Internal Strapi wire types ────────────────────────────────────────────
// These types match the actual REST API response shapes for recipe-related
// resources. They must not be exported.

type StrapiCategoryAttrs = {
  name: string;
  menuName: string | null;
  slug: string;
  description: string | null;
  image?: StrapiMediaRaw | null; // not fetched in recipe-list populate; always null there
};

type StrapiTagAttrs = {
  name: string;
  slug: string;
  description: string | null;
  image?: StrapiMediaRaw | null; // not fetched in recipe-list populate; always null there
};

type StrapiIngredientRaw = {
  id: number;
  ingredientName: string | null;
  amount: number | null;
  unit: string | null;
  note: string | null;
};

type StrapiIngredientSectionRaw = {
  id: number;
  title: string | null;
  ingredients: StrapiIngredientRaw[];
};

type StrapiStepRaw = {
  id: number;
  description: string;
  image: StrapiMediaRaw | null;
};

type StrapiPreparationSectionRaw = {
  id: number;
  title: string | null;
  steps: StrapiStepRaw[];
};

type StrapiTipRaw = {
  id: number;
  text: string;
};

type StrapiEquipmentItemRaw = {
  id: number;
  name: string;
};

type StrapiRecipeAttrs = {
  title: string;
  slug: string;
  image: StrapiMediaRaw | null;
  categories: StrapiData<StrapiCategoryAttrs>[];
  tags: StrapiData<StrapiTagAttrs>[];
  servings: number | null;
  prepTime: number | null;
  difficulty: Difficulty | null;
  description: string | null;
  ingredientSections: StrapiIngredientSectionRaw[];
  preparationSections: StrapiPreparationSectionRaw[];
  tips: StrapiTipRaw[];
  specialEquipment: StrapiEquipmentItemRaw[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

// Search/related endpoints return a projection — only listing-relevant fields.
type StrapiRecipeSummaryAttrs = {
  title: string;
  slug: string;
  difficulty: Difficulty | null;
  prepTime: number | null;
  servings: number | null;
  image: StrapiMediaRaw | null;
  categories: StrapiData<StrapiCategoryAttrs>[];
  tags: StrapiData<StrapiTagAttrs>[];
};

// ─── Mappers ──────────────────────────────────────────────────────────────

function mapCategory(raw: StrapiData<StrapiCategoryAttrs>): Category {
  return {
    id: raw.documentId,
    name: raw.name,
    menuName: raw.menuName ?? null,
    slug: raw.slug,
    description: raw.description ?? null,
    image: mapImage(raw.image ?? null),
  };
}

function mapTag(raw: StrapiData<StrapiTagAttrs>): Tag {
  return {
    id: raw.documentId,
    name: raw.name,
    slug: raw.slug,
    description: raw.description ?? null,
    image: mapImage(raw.image ?? null),
  };
}

function mapIngredient(raw: StrapiIngredientRaw): RecipeIngredient {
  return {
    ingredientName: raw.ingredientName ?? null,
    amount: raw.amount ?? null,
    unit: raw.unit ?? null,
    note: raw.note ?? null,
  };
}

function mapStep(raw: StrapiStepRaw): PreparationStep {
  return {
    description: raw.description,
    image: mapImage(raw.image),
  };
}

function mapIngredientSection(raw: StrapiIngredientSectionRaw): IngredientSection {
  return {
    title: raw.title ?? null,
    ingredients: (raw.ingredients ?? []).map(mapIngredient),
  };
}

function mapPreparationSection(raw: StrapiPreparationSectionRaw): PreparationSection {
  return {
    title: raw.title ?? null,
    steps: (raw.steps ?? []).map(mapStep),
  };
}

function mapTip(raw: StrapiTipRaw): RecipeTip {
  return { text: raw.text };
}

// Blank/whitespace-only names are dropped here so callers never need to
// re-validate — mirrors the HomeFeatureCard filtering pattern.
function mapEquipmentItem(raw: StrapiEquipmentItemRaw): SpecialEquipmentItem | null {
  const name = raw.name?.trim();
  return name ? { name } : null;
}

function mapRecipe(raw: StrapiData<StrapiRecipeAttrs>): Recipe {
  return {
    id: raw.documentId,
    title: raw.title,
    slug: raw.slug,
    image: mapImage(raw.image),
    categories: (raw.categories ?? []).map(mapCategory),
    tags: (raw.tags ?? []).map(mapTag),
    servings: raw.servings ?? null,
    prepTime: raw.prepTime ?? null,
    difficulty: raw.difficulty ?? null,
    description: raw.description ?? null,
    ingredientSections: (raw.ingredientSections ?? []).map(mapIngredientSection),
    preparationSections: (raw.preparationSections ?? []).map(mapPreparationSection),
    tips: (raw.tips ?? []).map(mapTip),
    specialEquipment: (raw.specialEquipment ?? [])
      .map(mapEquipmentItem)
      .filter((item): item is SpecialEquipmentItem => item !== null),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

function mapRecipeSummary(
  raw: StrapiData<StrapiRecipeSummaryAttrs>
): RecipeSummary {
  return {
    id: raw.documentId,
    title: raw.title,
    slug: raw.slug,
    difficulty: raw.difficulty ?? null,
    prepTime: raw.prepTime ?? null,
    servings: raw.servings ?? null,
    image: mapImage(raw.image),
    categories: (raw.categories ?? []).map(mapCategory),
    tags: (raw.tags ?? []).map(mapTag),
  };
}

// ─── Query string builders ────────────────────────────────────────────────
// Kept as plain strings to avoid a qs dependency at this stage.
// TODO: Replace with a proper serialiser (e.g. qs) if params grow complex.

const LIST_POPULATE =
  "populate[image]=true" +
  "&populate[categories][fields][0]=name" +
  "&populate[categories][fields][1]=slug" +
  "&populate[tags][fields][0]=name" +
  "&populate[tags][fields][1]=slug";

const DETAIL_POPULATE =
  "populate[image]=true" +
  "&populate[categories][fields][0]=name" +
  "&populate[categories][fields][1]=slug" +
  "&populate[tags][fields][0]=name" +
  "&populate[tags][fields][1]=slug" +
  "&populate[ingredientSections][populate][ingredients]=true" +
  "&populate[preparationSections][populate][steps][populate][image]=true" +
  "&populate[tips]=true" +
  "&populate[specialEquipment]=true";

// ─── Public API ───────────────────────────────────────────────────────────

/**
 * Fetches a paginated list of published recipes.
 * Populates image and categories only — sufficient for listing UIs.
 */
export async function getRecipes(
  params: PaginationParams = {}
): Promise<PaginatedResult<Recipe>> {
  const { page = 1, pageSize = 20 } = params;
  const qs = `${LIST_POPULATE}&sort[0]=publishedAt:desc&pagination[page]=${page}&pagination[pageSize]=${pageSize}&status=published`;
  const raw = await apiClient.get<StrapiList<StrapiRecipeAttrs>>(`/recipes?${qs}`);
  return {
    items: raw.data.map(mapRecipe),
    pagination: raw.meta.pagination,
  };
}

/**
 * Fetches a single recipe by slug with all fields populated.
 * Returns null if no published recipe with that slug exists.
 */
export async function getRecipeBySlug(slug: string): Promise<Recipe | null> {
  const qs =
    `${DETAIL_POPULATE}` +
    `&filters[slug][$eq]=${encodeURIComponent(slug)}` +
    `&status=published`;
  const raw = await apiClient.get<StrapiList<StrapiRecipeAttrs>>(`/recipes?${qs}`);
  const first = raw.data[0];
  return first ? mapRecipe(first) : null;
}

/**
 * Full-text search across recipe titles and ingredient names.
 * Uses the custom /recipes/search endpoint (pg_trgm similarity).
 * Returns a summary projection — detail fields are not populated.
 */
export async function searchRecipes(q: string): Promise<RecipeSummary[]> {
  const raw = await apiClient.get<{
    data: StrapiData<StrapiRecipeSummaryAttrs>[];
  }>(`/recipes/search?q=${encodeURIComponent(q)}`);
  return (raw.data ?? []).map(mapRecipeSummary);
}

/**
 * Ingredient-intent search: returns recipes that actually contain the given
 * ingredient name (ILIKE substring match on raw ingredient text). Does not
 * use fuzzy matching — avoids false positives from pg_trgm on Hebrew words.
 */
export async function searchRecipesByIngredient(ingredient: string): Promise<RecipeSummary[]> {
  const raw = await apiClient.get<{
    data: StrapiData<StrapiRecipeSummaryAttrs>[];
  }>(`/recipes/search?ingredient=${encodeURIComponent(ingredient)}`);
  return (raw.data ?? []).map(mapRecipeSummary);
}

/**
 * Fetches the most recently published recipes sorted by createdAt descending.
 * Returns a summary projection — no pagination needed for small fixed sets.
 */
export async function getLatestRecipes(limit = 4): Promise<RecipeSummary[]> {
  const qs =
    `${LIST_POPULATE}` +
    `&sort[0]=createdAt:desc` +
    `&pagination[pageSize]=${limit}` +
    `&status=published`;
  const raw = await apiClient.get<StrapiList<StrapiRecipeSummaryAttrs>>(`/recipes?${qs}`);
  return raw.data.map(mapRecipeSummary);
}

/**
 * Returns up to 4 related recipes for a given slug.
 * Selection and scoring are handled server-side — results are stable across refreshes.
 */
export async function getRelatedRecipes(slug: string): Promise<RecipeSummary[]> {
  const raw = await apiClient.get<{
    data: StrapiData<StrapiRecipeSummaryAttrs>[];
  }>(`/recipes/${encodeURIComponent(slug)}/related`);
  return (raw.data ?? []).map(mapRecipeSummary);
}

/**
 * Fetches a paginated list of published recipes belonging to a given category slug.
 */
export async function getRecipesByCategory(
  categorySlug: string,
  params: PaginationParams = {}
): Promise<PaginatedResult<RecipeSummary>> {
  const { page = 1, pageSize = 20 } = params;
  const qs =
    `${LIST_POPULATE}` +
    `&filters[categories][slug][$eq]=${encodeURIComponent(categorySlug)}` +
    `&sort[0]=publishedAt:desc` +
    `&pagination[page]=${page}&pagination[pageSize]=${pageSize}` +
    `&status=published`;
  const raw = await apiClient.get<StrapiList<StrapiRecipeSummaryAttrs>>(`/recipes?${qs}`);
  return {
    items: raw.data.map(mapRecipeSummary),
    pagination: raw.meta.pagination,
  };
}

/** Fetches one random published recipe. Returns null if no recipes exist. */
export async function getRandomRecipe(): Promise<{ slug: string; title: string } | null> {
  const raw = await apiClient.get<{ data: { slug: string; title: string } | null }>("/recipes/random");
  return raw.data;
}

/**
 * Fetches a paginated list of published recipes belonging to a given tag slug.
 */
export async function getRecipesByTag(
  tagSlug: string,
  params: PaginationParams = {}
): Promise<PaginatedResult<RecipeSummary>> {
  const { page = 1, pageSize = 20 } = params;
  const qs =
    `${LIST_POPULATE}` +
    `&filters[tags][slug][$eq]=${encodeURIComponent(tagSlug)}` +
    `&sort[0]=publishedAt:desc` +
    `&pagination[page]=${page}&pagination[pageSize]=${pageSize}` +
    `&status=published`;
  const raw = await apiClient.get<StrapiList<StrapiRecipeSummaryAttrs>>(`/recipes?${qs}`);
  return {
    items: raw.data.map(mapRecipeSummary),
    pagination: raw.meta.pagination,
  };
}
