import { describe, it, expect } from "vitest";
import type {
  Recipe,
  Category,
  Tag,
  Image,
  PreparationSection,
  IngredientSection,
} from "@/types/domain";
import { buildRecipeSchema, buildBreadcrumbSchema } from "./structuredData";
import { getSiteUrl } from "./seoConfig";

const IMAGE: Image = {
  url: "https://cdn.example.com/uploads/bolo.jpg",
  alt: "Bolo do Caco",
  width: 1200,
  height: 900,
};

function makeCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: "cat-1",
    name: "לחמים",
    menuName: null,
    slug: "breads",
    description: null,
    image: null,
    ...overrides,
  };
}

function makeTag(overrides: Partial<Tag> = {}): Tag {
  return {
    id: "tag-1",
    name: "פורטוגזי",
    slug: "portuguese",
    description: null,
    image: null,
    ...overrides,
  };
}

function makeIngredientSections(): IngredientSection[] {
  return [
    {
      title: null,
      ingredients: [
        {
          ingredientName: "קמח",
          amount: 500,
          unit: "גרם",
          note: null,
          preparationRecipe: null,
        },
      ],
    },
  ];
}

function makeRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: "recipe-1",
    title: "בולו דו קאקו",
    slug: "bolo-do-caco-bread-madeira",
    image: IMAGE,
    categories: [makeCategory()],
    tags: [makeTag()],
    servings: 4,
    prepTime: 30,
    totalTime: 90,
    difficulty: "medium",
    description: "לחם שטוח **מקסים** מהאי מדיירה.",
    ingredientSections: makeIngredientSections(),
    preparationSections: [
      {
        title: null,
        steps: [
          { description: "לערבב את הקמח עם המים.", image: null },
          { description: "ללוש **חמש** דקות.", image: null },
        ],
      },
    ],
    tips: [],
    specialEquipment: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-02-01T00:00:00.000Z",
    publishedAt: "2026-01-15T00:00:00.000Z",
    ...overrides,
  };
}

describe("buildRecipeSchema — image gating", () => {
  it("emits a valid Recipe block with an absolute image when the recipe has a real image", () => {
    const schema = buildRecipeSchema(makeRecipe());
    expect(schema).not.toBeNull();
    expect(schema?.["@type"]).toBe("Recipe");
    expect(schema?.image).toBe(IMAGE.url);
  });

  it("returns null when the recipe has no image — the whole block is withheld", () => {
    const schema = buildRecipeSchema(makeRecipe({ image: null }));
    expect(schema).toBeNull();
  });
});

describe("buildBreadcrumbSchema — independent of image presence", () => {
  it("still renders a full BreadcrumbList when the recipe has no image", () => {
    const schema = buildBreadcrumbSchema(makeRecipe({ image: null }));
    expect(schema["@type"]).toBe("BreadcrumbList");
    const items = schema.itemListElement as Record<string, unknown>[];
    expect(items.length).toBe(3);
  });

  it("still renders when the recipe has an image", () => {
    const schema = buildBreadcrumbSchema(makeRecipe());
    expect(schema["@type"]).toBe("BreadcrumbList");
  });
});

describe("buildRecipeSchema — author", () => {
  it("always includes the hardcoded Person author linked to /about", () => {
    const schema = buildRecipeSchema(makeRecipe());
    expect(schema?.author).toEqual({
      "@type": "Person",
      name: "Omer Arzi",
      url: `${getSiteUrl()}/about`,
    });
  });
});

describe("buildRecipeSchema — dates", () => {
  it("maps publishedAt to datePublished and updatedAt to dateModified", () => {
    const schema = buildRecipeSchema(makeRecipe());
    expect(schema?.datePublished).toBe("2026-01-15T00:00:00.000Z");
    expect(schema?.dateModified).toBe("2026-02-01T00:00:00.000Z");
  });

  it("falls back to createdAt for datePublished when publishedAt is null", () => {
    const schema = buildRecipeSchema(makeRecipe({ publishedAt: null }));
    expect(schema?.datePublished).toBe("2026-01-01T00:00:00.000Z");
  });
});

describe("buildRecipeSchema — categories, tags, tools, cuisine, diet", () => {
  it("includes recipeCategory joining all categories, and keywords joining all tags", () => {
    const schema = buildRecipeSchema(
      makeRecipe({
        categories: [makeCategory({ name: "לחמים" }), makeCategory({ name: "מאפים" })],
        tags: [makeTag({ name: "פורטוגזי" }), makeTag({ name: "צמחוני" })],
      }),
    );
    expect(schema?.recipeCategory).toBe("לחמים, מאפים");
    expect(schema?.keywords).toBe("פורטוגזי, צמחוני");
  });

  it("omits recipeCategory and keywords when there are none", () => {
    const schema = buildRecipeSchema(makeRecipe({ categories: [], tags: [] }));
    expect(schema).not.toHaveProperty("recipeCategory");
    expect(schema).not.toHaveProperty("keywords");
  });

  it("excludes a tag whose name duplicates a category name", () => {
    const schema = buildRecipeSchema(
      makeRecipe({
        categories: [makeCategory({ name: "לחמים" })],
        tags: [makeTag({ name: "לחמים" }), makeTag({ name: "פורטוגזי" })],
      }),
    );
    expect(schema?.keywords).toBe("פורטוגזי");
  });

  it("includes tool only when specialEquipment is present", () => {
    const withTools = buildRecipeSchema(
      makeRecipe({ specialEquipment: [{ name: "תנור אבן" }] }),
    );
    expect(withTools?.tool).toEqual(["תנור אבן"]);

    const withoutTools = buildRecipeSchema(makeRecipe({ specialEquipment: [] }));
    expect(withoutTools).not.toHaveProperty("tool");
  });

  it("never emits recipeCuisine or suitableForDiet — no source data exists", () => {
    const schema = buildRecipeSchema(makeRecipe());
    expect(schema).not.toHaveProperty("recipeCuisine");
    expect(schema).not.toHaveProperty("suitableForDiet");
  });
});

describe("buildRecipeSchema — recipeInstructions shape", () => {
  it("emits a flat HowToStep[] for a single untitled section", () => {
    const schema = buildRecipeSchema(makeRecipe());
    const instructions = schema?.recipeInstructions as Record<string, unknown>[];
    expect(instructions).toHaveLength(2);
    expect(instructions[0]["@type"]).toBe("HowToStep");
    expect(instructions[0].text).toBe("לערבב את הקמח עם המים.");
    // Markdown markers must not leak into HowToStep.text.
    expect(instructions[1].text).toBe("ללוש חמש דקות.");
    expect(instructions[1].text).not.toMatch(/\*/);
  });

  it("emits HowToSection[] for multiple sections, each with a global step-N url", () => {
    const preparationSections: PreparationSection[] = [
      { title: "לבצק", steps: [{ description: "שלב א", image: null }] },
      {
        title: "למילוי",
        steps: [
          { description: "שלב ב", image: null },
          { description: "שלב ג", image: null },
        ],
      },
    ];
    const recipe = makeRecipe({ preparationSections });
    const schema = buildRecipeSchema(recipe);
    const sections = schema?.recipeInstructions as Record<string, unknown>[];
    expect(sections).toHaveLength(2);
    expect(sections[0]["@type"]).toBe("HowToSection");
    expect(sections[0].name).toBe("לבצק");

    const firstStep = (sections[0].itemListElement as Record<string, unknown>[])[0];
    const secondStep = (sections[1].itemListElement as Record<string, unknown>[])[0];
    const thirdStep = (sections[1].itemListElement as Record<string, unknown>[])[1];

    const base = getSiteUrl();
    const canonicalUrl = `${base}/recipes/${recipe.slug}`;
    expect(firstStep.url).toBe(`${canonicalUrl}#step-1`);
    expect(secondStep.url).toBe(`${canonicalUrl}#step-2`);
    expect(thirdStep.url).toBe(`${canonicalUrl}#step-3`);
  });

  it("emits HowToSection[] (not flat) for a single section that has a title", () => {
    const recipe = makeRecipe({
      preparationSections: [
        { title: "אופן הכנה", steps: [{ description: "שלב יחיד", image: null }] },
      ],
    });
    const schema = buildRecipeSchema(recipe);
    const sections = schema?.recipeInstructions as Record<string, unknown>[];
    expect(sections).toHaveLength(1);
    expect(sections[0]["@type"]).toBe("HowToSection");
    expect(sections[0].name).toBe("אופן הכנה");
  });

  it("includes a step image only when that specific step has one, never the recipe hero image", () => {
    const recipe = makeRecipe({
      preparationSections: [
        {
          title: null,
          steps: [
            { description: "שלב עם תמונה", image: IMAGE },
            { description: "שלב בלי תמונה", image: null },
          ],
        },
      ],
    });
    const schema = buildRecipeSchema(recipe);
    const instructions = schema?.recipeInstructions as Record<string, unknown>[];
    expect(instructions[0].image).toBe(IMAGE.url);
    expect(instructions[1]).not.toHaveProperty("image");
  });

  it("never includes a HowToStep name — no per-step title exists in the data model", () => {
    const schema = buildRecipeSchema(makeRecipe());
    const instructions = schema?.recipeInstructions as Record<string, unknown>[];
    instructions.forEach((step) => expect(step).not.toHaveProperty("name"));
  });
});

describe("buildRecipeSchema — missing optional values produce no empty/invalid properties", () => {
  it("omits servings, prepTime, totalTime, description, ingredients, instructions, image-on-step when absent", () => {
    const recipe = makeRecipe({
      servings: null,
      prepTime: null,
      totalTime: null,
      description: null,
      ingredientSections: [],
      preparationSections: [],
      tips: [],
      specialEquipment: [],
      categories: [],
      tags: [],
    });
    const schema = buildRecipeSchema(recipe);
    expect(schema).not.toBeNull();
    expect(schema).not.toHaveProperty("recipeYield");
    expect(schema).not.toHaveProperty("prepTime");
    expect(schema).not.toHaveProperty("totalTime");
    expect(schema).not.toHaveProperty("description");
    expect(schema).not.toHaveProperty("recipeIngredient");
    expect(schema).not.toHaveProperty("recipeInstructions");
    expect(schema).not.toHaveProperty("recipeCategory");
    expect(schema).not.toHaveProperty("keywords");
    expect(schema).not.toHaveProperty("tool");
  });

  it("guards invalid prepTime/totalTime (zero, negative) the same way as before", () => {
    const schema = buildRecipeSchema(makeRecipe({ prepTime: 0, totalTime: -5 }));
    expect(schema).not.toHaveProperty("prepTime");
    expect(schema).not.toHaveProperty("totalTime");
  });
});
