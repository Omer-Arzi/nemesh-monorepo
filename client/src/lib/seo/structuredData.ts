/**
 * Structured data builders — schema.org JSON-LD for Google Rich Results.
 *
 * Rules:
 *   - All functions are pure and server-safe (no browser APIs).
 *   - Optional fields are omitted rather than set to null/undefined/empty.
 *   - Images must be absolute HTTP URLs — relative paths are silently dropped.
 *   - Do not add aggregateRating or review until the site has real user ratings.
 *   - `recipeCuisine` and `suitableForDiet` are never emitted — no source
 *     data exists for either in the current content model. Do not infer
 *     them from tags/categories text matching.
 */

import type { Recipe, RecipeIngredient, PreparationStep } from "@/types/domain";
import { ROUTES } from "@/constants";
import { computeSectionStepOffsets, stepAnchorId } from "@/lib/formatters/stepAnchors";
import { getSiteUrl, SITE_NAME, SITE_ALTERNATE_NAME, SITE_LOCALE } from "./seoConfig";
import { stripMarkdownToPlainText } from "./textUtils";

// No author/publisher field exists anywhere in the content model (site-setting
// only has activeThemeKey/logo/mobileLogo) — Product Owner decided a single
// hardcoded default author for every recipe, linked to the About page, rather
// than a required per-recipe Strapi field. No per-recipe override exists.
const RECIPE_AUTHOR_NAME = "Omer Arzi";

// Mirrors the tag name used by `findShirChallenge` in
// `app/(standard)/categories/page.tsx` — excluded from JSON-LD `keywords`
// because it's a site-navigation tag, not a useful public search keyword.
const SHIR_CHALLENGE_TAG_NAME = "האתגר של שיר";

function buildRecipeAuthor(): Record<string, unknown> {
  return {
    "@type": "Person",
    name: RECIPE_AUTHOR_NAME,
    url: `${getSiteUrl()}/about`,
  };
}

function minutesToIsoDuration(minutes: number | null | undefined): string | null {
  if (!minutes || minutes <= 0 || !Number.isFinite(minutes)) return null;
  return `PT${minutes}M`;
}

function formatIngredient(ing: RecipeIngredient): string | null {
  if (!ing.ingredientName?.trim()) return null;
  const parts: string[] = [];
  if (ing.amount !== null) parts.push(String(ing.amount));
  if (ing.unit?.trim()) parts.push(ing.unit.trim());
  parts.push(ing.ingredientName.trim());
  if (ing.note?.trim()) parts.push(`(${ing.note.trim()})`);
  return parts.join(" ");
}

function toAbsoluteImageUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  // S3/CDN URLs are already absolute; relative paths from Strapi dev are not usable in structured data.
  return url.startsWith("http") ? url : null;
}

function buildHowToStep(
  step: PreparationStep,
  globalStepNumber: number,
  canonicalUrl: string,
): Record<string, unknown> | null {
  const text = stripMarkdownToPlainText(step.description ?? "");
  if (!text) return null;

  const howToStep: Record<string, unknown> = {
    "@type": "HowToStep",
    text,
    url: `${canonicalUrl}#${stepAnchorId(globalStepNumber)}`,
  };

  const imgUrl = toAbsoluteImageUrl(step.image?.url);
  if (imgUrl) howToStep.image = imgUrl;

  return howToStep;
}

/**
 * Maps `recipe.preparationSections` to `recipeInstructions`:
 *   - Exactly one section with no title → flat `HowToStep[]` (matches the
 *     on-screen convention where a single unnamed section gets no subheading).
 *   - Otherwise → `HowToSection[]`, each wrapping its own `HowToStep[]`.
 *
 * Step numbering (and therefore each step's `url`) uses the same global,
 * cross-section counter as the rendered DOM anchors — see stepAnchors.ts.
 */
function buildRecipeInstructions(recipe: Recipe, canonicalUrl: string): unknown[] {
  const sections = recipe.preparationSections;
  const offsets = computeSectionStepOffsets(sections);

  const buildStepsForSection = (sectionIndex: number) =>
    sections[sectionIndex].steps
      .map((step, i) => buildHowToStep(step, offsets[sectionIndex] + i + 1, canonicalUrl))
      .filter((s): s is Record<string, unknown> => s !== null);

  const isFlat = sections.length === 1 && sections[0].title === null;
  if (isFlat) return buildStepsForSection(0);

  return sections
    .map((section, sectionIndex) => {
      const itemListElement = buildStepsForSection(sectionIndex);
      if (itemListElement.length === 0) return null;

      const howToSection: Record<string, unknown> = {
        "@type": "HowToSection",
        itemListElement,
      };
      if (section.title) howToSection.name = section.title;
      return howToSection;
    })
    .filter((s): s is Record<string, unknown> => s !== null);
}

function buildKeywords(recipe: Recipe): string | null {
  const categoryNames = new Set(recipe.categories.map((c) => c.name));
  const excluded = new Set([...categoryNames, SHIR_CHALLENGE_TAG_NAME]);

  const tagNames = recipe.tags
    .map((t) => t.name?.trim())
    .filter((name): name is string => !!name && !excluded.has(name));

  return tagNames.length > 0 ? tagNames.join(", ") : null;
}

// ── WebSite ───────────────────────────────────────────────────────────────────

export function buildWebSiteSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: SITE_ALTERNATE_NAME,
    url: getSiteUrl(),
    inLanguage: SITE_LOCALE,
  };
}

// ── Recipe ────────────────────────────────────────────────────────────────────

/**
 * Builds the Recipe JSON-LD block, or `null` when the recipe has no real,
 * resolved, absolute image. A Recipe with no image intentionally renders NO
 * Recipe JSON-LD at all (not a schema object missing `image`) — the page
 * itself remains a normal indexable page either way; only this one
 * structured-data block is withheld. This is independent of the OG/Twitter
 * image fallback in `generateMetadata()`, which keeps using
 * `DEFAULT_OG_IMAGE` regardless — never put that fallback in this `image`
 * field.
 */
export function buildRecipeSchema(recipe: Recipe): Record<string, unknown> | null {
  const imageUrl = toAbsoluteImageUrl(recipe.image?.url);
  if (!imageUrl) return null;

  const base = getSiteUrl();
  const canonicalUrl = `${base}${ROUTES.RECIPE(recipe.slug)}`;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    url: canonicalUrl,
    inLanguage: SITE_LOCALE,
    image: imageUrl,
    author: buildRecipeAuthor(),
  };

  const description = stripMarkdownToPlainText(recipe.description ?? "");
  if (description) schema.description = description;

  // `getRecipeBySlug` already filters `status=published`, so `publishedAt`
  // should always be set for anything reaching this builder — `createdAt`
  // fallback is defensive only.
  const datePublished = recipe.publishedAt ?? recipe.createdAt;
  if (datePublished) schema.datePublished = datePublished;

  if (recipe.updatedAt) schema.dateModified = recipe.updatedAt;

  if (recipe.servings !== null && recipe.servings > 0) {
    schema.recipeYield = `${recipe.servings} מנות`;
  }

  const prepTime = minutesToIsoDuration(recipe.prepTime);
  if (prepTime) schema.prepTime = prepTime;

  const totalTime = minutesToIsoDuration(recipe.totalTime);
  if (totalTime) schema.totalTime = totalTime;

  const ingredients = recipe.ingredientSections
    .flatMap((s) => s.ingredients)
    .map(formatIngredient)
    .filter((s): s is string => s !== null);
  if (ingredients.length > 0) schema.recipeIngredient = ingredients;

  const instructions = buildRecipeInstructions(recipe, canonicalUrl);
  if (instructions.length > 0) schema.recipeInstructions = instructions;

  const categoryNames = recipe.categories.map((c) => c.name).filter(Boolean);
  if (categoryNames.length > 0) schema.recipeCategory = categoryNames.join(", ");

  const keywords = buildKeywords(recipe);
  if (keywords) schema.keywords = keywords;

  const tools = recipe.specialEquipment.map((item) => item.name).filter(Boolean);
  if (tools.length > 0) schema.tool = tools;

  return schema;
}

// ── BreadcrumbList ────────────────────────────────────────────────────────────

export function buildBreadcrumbSchema(recipe: Recipe): Record<string, unknown> {
  const base = getSiteUrl();
  const recipeUrl = `${base}${ROUTES.RECIPE(recipe.slug)}`;
  const firstCategory = recipe.categories[0] ?? null;

  const items: Record<string, unknown>[] = [
    { "@type": "ListItem", position: 1, name: "בית", item: base },
  ];

  if (firstCategory) {
    items.push({
      "@type": "ListItem",
      position: 2,
      name: firstCategory.menuName ?? firstCategory.name,
      item: `${base}${ROUTES.CATEGORY(firstCategory.slug)}`,
    });
    items.push({ "@type": "ListItem", position: 3, name: recipe.title, item: recipeUrl });
  } else {
    items.push({ "@type": "ListItem", position: 2, name: recipe.title, item: recipeUrl });
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}
