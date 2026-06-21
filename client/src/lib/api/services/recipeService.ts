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
  RecipeIngredient,
  PreparationStep,
  RecipeTip,
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
  slug: string;
  description: string | null;
};

type StrapiIngredientRaw = {
  id: number;
  ingredientName: string | null;
  amount: number | null;
  unit: string | null;
  note: string | null;
};

type StrapiStepRaw = {
  id: number;
  description: string;
  image: StrapiMediaRaw | null;
};

type StrapiTipRaw = {
  id: number;
  text: string;
};

type StrapiRecipeAttrs = {
  title: string;
  slug: string;
  image: StrapiMediaRaw | null;
  categories: StrapiData<StrapiCategoryAttrs>[];
  servings: number | null;
  prepTime: number | null;
  difficulty: Difficulty | null;
  description: string | null;
  ingredients: StrapiIngredientRaw[];
  steps: StrapiStepRaw[];
  tips: StrapiTipRaw[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

// Search endpoint returns a projection — only listing-relevant fields.
type StrapiRecipeSummaryAttrs = {
  title: string;
  slug: string;
  difficulty: Difficulty | null;
  prepTime: number | null;
  servings: number | null;
  image: StrapiMediaRaw | null;
  categories: StrapiData<StrapiCategoryAttrs>[];
};

// ─── Mappers ──────────────────────────────────────────────────────────────

function mapCategory(raw: StrapiData<StrapiCategoryAttrs>): Category {
  return {
    id: raw.documentId,
    name: raw.name,
    slug: raw.slug,
    description: raw.description ?? null,
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

function mapTip(raw: StrapiTipRaw): RecipeTip {
  return { text: raw.text };
}

function mapRecipe(raw: StrapiData<StrapiRecipeAttrs>): Recipe {
  return {
    id: raw.documentId,
    title: raw.title,
    slug: raw.slug,
    image: mapImage(raw.image),
    categories: (raw.categories ?? []).map(mapCategory),
    servings: raw.servings ?? null,
    prepTime: raw.prepTime ?? null,
    difficulty: raw.difficulty ?? null,
    description: raw.description ?? null,
    ingredients: (raw.ingredients ?? []).map(mapIngredient),
    steps: (raw.steps ?? []).map(mapStep),
    tips: (raw.tips ?? []).map(mapTip),
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
  };
}

// ─── Query string builders ────────────────────────────────────────────────
// Kept as plain strings to avoid a qs dependency at this stage.
// TODO: Replace with a proper serialiser (e.g. qs) if params grow complex.

const LIST_POPULATE =
  "populate[image]=true" +
  "&populate[categories][fields][0]=name" +
  "&populate[categories][fields][1]=slug";

const DETAIL_POPULATE =
  "populate[image]=true" +
  "&populate[categories][fields][0]=name" +
  "&populate[categories][fields][1]=slug" +
  "&populate[ingredients]=true" +
  "&populate[steps][populate][image]=true" +
  "&populate[tips]=true";

// ─── Public API ───────────────────────────────────────────────────────────

/**
 * Fetches a paginated list of published recipes.
 * Populates image and categories only — sufficient for listing UIs.
 */
export async function getRecipes(
  params: PaginationParams = {}
): Promise<PaginatedResult<Recipe>> {
  const { page = 1, pageSize = 20 } = params;
  const qs = `${LIST_POPULATE}&pagination[page]=${page}&pagination[pageSize]=${pageSize}&status=published`;
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
 * Returns up to 4 related recipes for a given slug.
 * Selection and scoring are handled server-side — results are stable across refreshes.
 */
export async function getRelatedRecipes(slug: string): Promise<RecipeSummary[]> {
  const raw = await apiClient.get<{
    data: StrapiData<StrapiRecipeSummaryAttrs>[];
  }>(`/recipes/${encodeURIComponent(slug)}/related`);
  return (raw.data ?? []).map(mapRecipeSummary);
}
