import { describe, it, expect, vi } from "vitest";
import type { ReactNode } from "react";
import { screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderWithTheme as render } from "@/test/renderWithTheme";
import type { Recipe, RecipeSummary } from "@/types/domain";
import RecipePageClient from "./RecipePageClient";
import { RecipePageText } from "./consts";

// jsdom implements none of these — RecipeHero/StickyIngredientsSidebar use
// them for layout measurement, irrelevant to what these tests assert.
vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);
vi.stubGlobal(
  "IntersectionObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);
window.scrollTo = vi.fn();

// NOTE: RecipeContent always renders a plain `<style>` tag carrying
// `pageStyle` (see buildPrintPageStyle.ts). Its `@page` nested margin-box
// at-rules are valid
// CSS that real browsers (Chromium 131+ / Safari 18.2+) support — jsdom's own
// CSS parser doesn't, so it logs a harmless "Could not parse CSS stylesheet"
// error via its virtual console on every render in this file. That log
// bypasses the page's own `console`, so it can't be silenced with a
// `console.error` spy; it does not fail any test.

vi.mock("@/lib/analytics", () => ({
  analytics: {
    trackRecipeView: vi.fn(),
    trackCookingModeStart: vi.fn(),
    trackCookingModeExit: vi.fn(),
  },
}));

const getRecipeBySlug = vi.fn();
const getRelatedRecipes = vi.fn();

vi.mock("@/lib/api/services/recipeService", () => ({
  getRecipeBySlug: (...args: unknown[]) => getRecipeBySlug(...args),
  getRelatedRecipes: (...args: unknown[]) => getRelatedRecipes(...args),
}));

function makeWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

function makeRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: "rec-1",
    title: "עוגת שוקולד",
    slug: "chocolate-cake",
    image: null,
    categories: [],
    tags: [],
    servings: 8,
    prepTime: 20,
    totalTime: null,
    difficulty: "easy",
    description: "עוגת שוקולד עשירה ולחה, מושלמת לכל אירוע.",
    ingredientSections: [
      {
        title: null,
        ingredients: [
          { ingredientName: "קמח", amount: 2, unit: "כוסות", note: null, preparationRecipe: null },
        ],
      },
    ],
    preparationSections: [
      { title: null, steps: [{ description: "מערבבים הכל יחד ואופים.", image: null }] },
    ],
    tips: [],
    specialEquipment: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    publishedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeRelated(overrides: Partial<RecipeSummary> = {}): RecipeSummary {
  return {
    id: "rec-2",
    title: "עוגיות שוקולד",
    slug: "chocolate-cookies",
    image: null,
    categories: [],
    tags: [],
    difficulty: null,
    prepTime: null,
    totalTime: null,
    servings: null,
    ...overrides,
  };
}

describe("RecipePageClient", () => {
  it("renders the recipe h1, description and steps from initialData with no loading flash", () => {
    // Neither service function should even need to resolve for the first
    // render — this is what makes the server-rendered HTML contain real
    // recipe content instead of a loading state.
    getRecipeBySlug.mockReturnValue(new Promise(() => {}));
    getRelatedRecipes.mockReturnValue(new Promise(() => {}));

    const recipe = makeRecipe();

    render(
      <RecipePageClient
        slug="chocolate-cake"
        initialRecipe={recipe}
        initialRelatedRecipes={[]}
      />,
      { wrapper: makeWrapper() },
    );

    expect(screen.getByRole("heading", { level: 1, name: "עוגת שוקולד" })).toBeInTheDocument();
    expect(screen.getByText("עוגת שוקולד עשירה ולחה, מושלמת לכל אירוע.")).toBeInTheDocument();
    // Appears twice: once in the visible step list, once in the hidden print
    // document — both are legitimate, so assert presence rather than a
    // single match.
    expect(screen.getAllByText("מערבבים הכל יחד ואופים.").length).toBeGreaterThan(0);
    expect(screen.queryByText(RecipePageText.loading)).not.toBeInTheDocument();
  });

  it("renders the related-recipes rail from initialRelatedRecipes", () => {
    getRecipeBySlug.mockReturnValue(new Promise(() => {}));
    getRelatedRecipes.mockReturnValue(new Promise(() => {}));

    render(
      <RecipePageClient
        slug="chocolate-cake"
        initialRecipe={makeRecipe()}
        initialRelatedRecipes={[makeRelated()]}
      />,
      { wrapper: makeWrapper() },
    );

    expect(screen.getByText("עוגיות שוקולד")).toBeInTheDocument();
  });

  it("two different recipes render distinct h1/content", () => {
    getRecipeBySlug.mockReturnValue(new Promise(() => {}));
    getRelatedRecipes.mockReturnValue(new Promise(() => {}));

    const { unmount } = render(
      <RecipePageClient slug="chocolate-cake" initialRecipe={makeRecipe()} initialRelatedRecipes={[]} />,
      { wrapper: makeWrapper() },
    );
    expect(screen.getByRole("heading", { level: 1, name: "עוגת שוקולד" })).toBeInTheDocument();
    unmount();

    render(
      <RecipePageClient
        slug="lemon-tart"
        initialRecipe={makeRecipe({ title: "טארט לימון", slug: "lemon-tart" })}
        initialRelatedRecipes={[]}
      />,
      { wrapper: makeWrapper() },
    );
    expect(screen.getByRole("heading", { level: 1, name: "טארט לימון" })).toBeInTheDocument();
  });
});
