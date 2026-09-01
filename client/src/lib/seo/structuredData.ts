/**
 * Structured data builders — schema.org JSON-LD for Google Rich Results.
 *
 * Rules:
 *   - All functions are pure and server-safe (no browser APIs).
 *   - Optional fields are omitted rather than set to null/undefined/empty.
 *   - Images must be absolute HTTP URLs — relative paths are silently dropped.
 *   - Do not add aggregateRating or review until the site has real user ratings.
 */

import type { Recipe, RecipeIngredient } from "@/types/domain";
import { ROUTES } from "@/constants";
import { getSiteUrl, SITE_NAME, SITE_ALTERNATE_NAME, SITE_LOCALE } from "./seoConfig";

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

export function buildRecipeSchema(recipe: Recipe): Record<string, unknown> {
  const base = getSiteUrl();

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    url: `${base}${ROUTES.RECIPE(recipe.slug)}`,
    inLanguage: SITE_LOCALE,
  };

  const description = recipe.description?.trim();
  if (description) schema.description = description;

  const imageUrl = toAbsoluteImageUrl(recipe.image?.url);
  if (imageUrl) schema.image = imageUrl;

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

  const instructions = recipe.preparationSections
    .flatMap((s) => s.steps)
    .map((step) => {
      const text = step.description?.trim();
      if (!text) return null;
      const howToStep: Record<string, unknown> = { "@type": "HowToStep", text };
      if (step.image) {
        const imgUrl = toAbsoluteImageUrl(step.image.url);
        if (imgUrl) howToStep.image = imgUrl;
      }
      return howToStep;
    })
    .filter((s): s is Record<string, unknown> => s !== null);
  if (instructions.length > 0) schema.recipeInstructions = instructions;

  const firstCategory = recipe.categories[0];
  if (firstCategory?.name) schema.recipeCategory = firstCategory.name;

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
