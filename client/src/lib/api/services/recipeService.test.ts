import { describe, it, expect, vi } from "vitest";
import { apiClient } from "../client";
import { getRecipeBySlug } from "./recipeService";

vi.mock("../client", () => ({
  apiClient: { get: vi.fn() },
}));

// Minimal Strapi v5-shaped fixture — only the fields mapRecipe actually reads.
function makeRawRecipe(overrides: {
  slug: string;
  ingredientPreparationRecipe?: unknown;
}) {
  return {
    data: [
      {
        id: 1,
        documentId: "recipe-1",
        title: "פיצה",
        slug: overrides.slug,
        image: null,
        categories: [],
        tags: [],
        servings: 4,
        prepTime: 30,
        difficulty: "medium",
        description: null,
        ingredientSections: [
          {
            id: 1,
            title: null,
            ingredients: [
              {
                id: 1,
                ingredientName: "ריבת לימון",
                amount: 2,
                unit: "כפות",
                note: null,
                preparationRecipe: overrides.ingredientPreparationRecipe ?? null,
              },
            ],
          },
        ],
        preparationSections: [],
        tips: [],
        specialEquipment: [],
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ],
  };
}

describe("getRecipeBySlug — preparationRecipe mapping", () => {
  it("maps a valid published preparationRecipe to a link-ready reference", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce(
      makeRawRecipe({
        slug: "pizza",
        ingredientPreparationRecipe: {
          documentId: "recipe-jam",
          title: "ריבת לימון ביתית",
          slug: "ribat-limon",
          publishedAt: "2026-01-01T00:00:00.000Z",
        },
      })
    );

    const recipe = await getRecipeBySlug("pizza");
    expect(recipe?.ingredientSections[0].ingredients[0].preparationRecipe).toEqual({
      title: "ריבת לימון ביתית",
      slug: "ribat-limon",
    });
  });

  it("drops the link when the target recipe is unpublished (no publishedAt)", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce(
      makeRawRecipe({
        slug: "pizza",
        ingredientPreparationRecipe: {
          documentId: "recipe-jam",
          title: "ריבת לימון ביתית",
          slug: "ribat-limon",
          publishedAt: null,
        },
      })
    );

    const recipe = await getRecipeBySlug("pizza");
    expect(recipe?.ingredientSections[0].ingredients[0].preparationRecipe).toBeNull();
  });

  it("drops the link when the relation is missing/deleted (null)", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce(
      makeRawRecipe({ slug: "pizza", ingredientPreparationRecipe: null })
    );

    const recipe = await getRecipeBySlug("pizza");
    expect(recipe?.ingredientSections[0].ingredients[0].preparationRecipe).toBeNull();
  });

  it("drops the link when the target recipe is the current recipe itself (self-reference)", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce(
      makeRawRecipe({
        slug: "pizza",
        ingredientPreparationRecipe: {
          documentId: "recipe-1",
          title: "פיצה",
          slug: "pizza", // same slug as the recipe being fetched
          publishedAt: "2026-01-01T00:00:00.000Z",
        },
      })
    );

    const recipe = await getRecipeBySlug("pizza");
    expect(recipe?.ingredientSections[0].ingredients[0].preparationRecipe).toBeNull();
  });

  it("old ingredients with no preparationRecipe field at all keep working unchanged", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce(makeRawRecipe({ slug: "pizza" }));

    const recipe = await getRecipeBySlug("pizza");
    const ingredient = recipe?.ingredientSections[0].ingredients[0];
    expect(ingredient?.preparationRecipe).toBeNull();
    expect(ingredient?.ingredientName).toBe("ריבת לימון");
    expect(ingredient?.amount).toBe(2);
  });
});
