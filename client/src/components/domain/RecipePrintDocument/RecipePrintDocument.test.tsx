import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithTheme as render } from "@/test/renderWithTheme";
import type { Recipe } from "@/types/domain";
import RecipePrintDocument from "./RecipePrintDocument";
import { RecipePrintDocumentText as T } from "./RecipePrintDocument.consts";
import { PreparationStepsSectionText } from "../PreparationStepsSection/PreparationStepsSection.consts";

function makeRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: "rec-1",
    title: "עוגת שוקולד",
    slug: "chocolate-cake",
    image: null,
    categories: [],
    tags: [],
    servings: null,
    prepTime: null,
    totalTime: null,
    difficulty: null,
    description: null,
    ingredientSections: [{ title: null, ingredients: [] }],
    preparationSections: [{ title: null, steps: [] }],
    tips: [],
    specialEquipment: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const FULL = makeRecipe({
  image: { url: "https://cdn.example/cake.jpg", alt: "עוגה", width: 800, height: 533 },
  servings: 8,
  prepTime: 20,
  totalTime: 75,
  difficulty: "easy",
  description: "סיפור רקע שלא אמור להיות בהדפסה בכלל",
  categories: [
    { id: "c1", name: "קינוחים", menuName: null, slug: "desserts", description: null, image: null },
  ],
  tags: [{ id: "t1", name: "חגיגי", slug: "festive", description: null, image: null }],
  tips: [{ text: "טיפ ראשון" }, { text: "טיפ שני" }],
  specialEquipment: [{ name: "מיקסר" }, { name: "  " }, { name: "תבנית קפיץ" }],
  ingredientSections: [
    {
      title: "לבצק",
      ingredients: [
        { ingredientName: "קמח", amount: 2, unit: "כוסות", note: "מנופה", preparationRecipe: null },
        { ingredientName: "חמאה", amount: 100, unit: "גרם", note: null, preparationRecipe: null },
      ],
    },
    {
      title: "לציפוי",
      ingredients: [
        {
          ingredientName: "ריבת חלב",
          amount: 1,
          unit: "צנצנת",
          note: null,
          preparationRecipe: { title: "ריבת חלב ביתית", slug: "dulce" },
        },
      ],
    },
  ],
  preparationSections: [
    {
      title: "הכנת הבצק",
      steps: [
        { description: "מערבבים קמח וחמאה", image: null },
        {
          description: "מקררים חצי שעה",
          image: { url: "https://cdn.example/step.jpg", alt: "שלב", width: 400, height: 300 },
        },
      ],
    },
    {
      title: "הרכבה",
      steps: [{ description: "מורחים ציפוי ומגישים", image: null }],
    },
  ],
});

describe("RecipePrintDocument", () => {
  it("renders the sections in the fixed order: tips → equipment → ingredients → steps", () => {
    render(<RecipePrintDocument recipe={FULL} />);
    const sectionHeadings = screen
      .getAllByRole("heading", { level: 2 })
      .map((h) => h.textContent);
    expect(sectionHeadings).toEqual([
      T.tipsTitle,
      T.equipmentTitle,
      T.ingredientsTitle,
      PreparationStepsSectionText.sectionTitle,
    ]);
  });

  it("renders the title as the single h1 and the site logo", () => {
    render(<RecipePrintDocument recipe={FULL} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("עוגת שוקולד");
    expect(screen.getByRole("img", { name: T.logoAlt })).toBeInTheDocument();
  });

  it("renders the metadata run from set fields only, and omits it entirely when none are set", () => {
    const { unmount } = render(<RecipePrintDocument recipe={FULL} />);
    expect(screen.getByText(/מנות/)).toBeInTheDocument();
    expect(screen.getByText(/זמן עבודה/)).toBeInTheDocument();
    expect(screen.getByText(/זמן כולל/)).toBeInTheDocument();
    expect(screen.getByText(/רמת קושי/)).toBeInTheDocument();
    unmount();

    render(<RecipePrintDocument recipe={makeRecipe()} />);
    expect(screen.queryByText(/מנות/)).not.toBeInTheDocument();
    expect(screen.queryByText(/רמת קושי/)).not.toBeInTheDocument();
  });

  it("omits tips, equipment, photo and metadata blocks when their data is absent", () => {
    render(<RecipePrintDocument recipe={makeRecipe()} />);
    expect(screen.queryByText(T.tipsTitle)).not.toBeInTheDocument();
    expect(screen.queryByText(T.equipmentTitle)).not.toBeInTheDocument();
    expect(screen.queryByText(T.ingredientsTitle)).not.toBeInTheDocument();
    expect(screen.queryByText(PreparationStepsSectionText.sectionTitle)).not.toBeInTheDocument();
    // Only the logo image — no recipe photo.
    expect(screen.getAllByRole("img")).toHaveLength(1);
  });

  it("shows all tips expanded with no count", () => {
    render(<RecipePrintDocument recipe={FULL} />);
    expect(screen.getByText("טיפ ראשון")).toBeInTheDocument();
    expect(screen.getByText("טיפ שני")).toBeInTheDocument();
    expect(screen.getByText(T.tipsTitle)).toBeInTheDocument();
    expect(screen.queryByText(/הערות מהמטבח \(/)).not.toBeInTheDocument();
  });

  it("renders special equipment as a plain run, dropping blank names", () => {
    render(<RecipePrintDocument recipe={FULL} />);
    expect(screen.getByText("מיקסר · תבנית קפיץ")).toBeInTheDocument();
  });

  it("keeps named ingredient groups as subheadings and renders every line's parts", () => {
    render(<RecipePrintDocument recipe={FULL} />);
    expect(screen.getByRole("heading", { name: "לבצק" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "לציפוי" })).toBeInTheDocument();
    expect(screen.getByText(/כוסות/)).toBeInTheDocument();
    expect(screen.getByText(/מנופה/)).toBeInTheDocument();
  });

  it("wraps an ingredient subheading with its first lines so it can't strand at a page foot", () => {
    render(<RecipePrintDocument recipe={FULL} />);
    // "לבצק" has 2 lines — both share the keep-with-start wrapper.
    const wrapper = screen.getByRole("heading", { name: "לבצק" }).parentElement!;
    expect(wrapper).toHaveTextContent("קמח");
    expect(wrapper).toHaveTextContent("חמאה");
  });

  it("wraps a step subheading with its first step so it can't strand at a page foot", () => {
    render(<RecipePrintDocument recipe={FULL} />);
    // "הכנת הבצק" has 2 steps; only the first shares the keep-with-start wrapper.
    const wrapper = screen.getByRole("heading", { name: "הכנת הבצק" }).parentElement!;
    expect(wrapper).toHaveTextContent("מערבבים קמח וחמאה");
    expect(wrapper).not.toHaveTextContent("מקררים חצי שעה");
  });

  it("prints a sub-recipe ingredient as its own name in plain text — no link, no URL", () => {
    render(<RecipePrintDocument recipe={FULL} />);
    expect(screen.getByText(/ריבת חלב/)).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByText(/dulce/)).not.toBeInTheDocument();
  });

  it("renders a single unnamed ingredient section with no group subheading", () => {
    const recipe = makeRecipe({
      ingredientSections: [
        {
          title: null,
          ingredients: [
            { ingredientName: "מלח", amount: 1, unit: "כפית", note: null, preparationRecipe: null },
          ],
        },
      ],
    });
    render(<RecipePrintDocument recipe={recipe} />);
    expect(screen.getByText(T.ingredientsTitle)).toBeInTheDocument();
    expect(screen.getByText(/מלח/)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 3 })).not.toBeInTheDocument();
  });

  it("numbers steps restarting at 1 per group, and never prints step images", () => {
    render(<RecipePrintDocument recipe={FULL} />);
    const numbers = screen.getAllByText(/^\d+\.$/).map((n) => n.textContent);
    expect(numbers).toEqual(["1.", "2.", "1."]);
    expect(screen.getByText("מקררים חצי שעה")).toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: "שלב" }),
    ).not.toBeInTheDocument();
  });

  it("excludes the description, categories and tags", () => {
    render(<RecipePrintDocument recipe={FULL} />);
    expect(screen.queryByText(/סיפור רקע/)).not.toBeInTheDocument();
    expect(screen.queryByText("קינוחים")).not.toBeInTheDocument();
    expect(screen.queryByText("חגיגי")).not.toBeInTheDocument();
  });
});
