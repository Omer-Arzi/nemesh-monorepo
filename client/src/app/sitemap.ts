import type { MetadataRoute } from "next";
import { getRecipes } from "@/lib/api/services/recipeService";
import { getCategories } from "@/lib/api/services/categoryService";
import { ROUTES } from "@/constants";
import { getSiteUrl } from "@/lib/seo";

// Walks all pages of getRecipes so every published recipe appears in the sitemap.
async function fetchAllRecipes() {
  const pageSize = 100;
  let page = 1;
  const items = [];

  while (true) {
    const result = await getRecipes({ page, pageSize });
    items.push(...result.items);
    if (page >= result.pagination.pageCount) break;
    page++;
  }

  return items;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: `${base}${ROUTES.HOME}`,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${base}${ROUTES.CATEGORIES}`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  let recipeUrls: MetadataRoute.Sitemap = [];
  try {
    const recipes = await fetchAllRecipes();
    recipeUrls = recipes.map((recipe) => ({
      url: `${base}${ROUTES.RECIPE(recipe.slug)}`,
      lastModified: recipe.updatedAt ? new Date(recipe.updatedAt) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));
  } catch {
    // Dynamic fetch failed — sitemap returns static URLs only.
  }

  let categoryUrls: MetadataRoute.Sitemap = [];
  try {
    const categories = await getCategories();
    categoryUrls = categories.map((category) => ({
      url: `${base}${ROUTES.CATEGORY(category.slug)}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // Dynamic fetch failed — sitemap returns static URLs only.
  }

  return [...staticUrls, ...recipeUrls, ...categoryUrls];
}
