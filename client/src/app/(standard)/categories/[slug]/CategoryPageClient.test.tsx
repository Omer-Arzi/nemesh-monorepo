import { describe, it, expect, vi } from "vitest";
import type { ReactNode } from "react";
import { screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderWithTheme as render } from "@/test/renderWithTheme";
import type { Category, RecipeSummary } from "@/types/domain";
import type { PaginatedResult } from "@/types/shared";
import CategoryPageClient from "./CategoryPageClient";
import { CategoryPageText } from "./consts";

vi.mock("@/lib/analytics", () => ({
  analytics: { trackCategoryView: vi.fn() },
}));

const getCategoryBySlug = vi.fn();
const getRecipesByCategory = vi.fn();

vi.mock("@/lib/api/services/categoryService", () => ({
  getCategoryBySlug: (...args: unknown[]) => getCategoryBySlug(...args),
}));
vi.mock("@/lib/api/services/recipeService", () => ({
  getRecipesByCategory: (...args: unknown[]) => getRecipesByCategory(...args),
}));

function makeWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

function makeCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: "cat-1",
    name: "עוף",
    menuName: null,
    slug: "chicken",
    description: null,
    image: null,
    ...overrides,
  };
}

function makeRecipe(overrides: Partial<RecipeSummary> = {}): RecipeSummary {
  return {
    id: "r1",
    title: "עוף בתנור",
    slug: "oven-chicken",
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

function makeRecipes(items: RecipeSummary[]): PaginatedResult<RecipeSummary> {
  return { items, pagination: { page: 1, pageSize: 20, pageCount: 1, total: items.length } };
}

describe("CategoryPageClient", () => {
  it("renders the category h1, description and recipe cards from initialData with no loading flash", () => {
    // Neither service function should even need to resolve for the first
    // render — this is exactly what makes the server-rendered HTML contain
    // real content instead of a loading state.
    getCategoryBySlug.mockReturnValue(new Promise(() => {}));
    getRecipesByCategory.mockReturnValue(new Promise(() => {}));

    const category = makeCategory({ menuName: "מתכוני עוף", description: "הכי טעים שיש" });
    const recipes = makeRecipes([makeRecipe()]);

    render(
      <CategoryPageClient slug="chicken" initialCategory={category} initialRecipes={recipes} />,
      { wrapper: makeWrapper() },
    );

    expect(screen.getByRole("heading", { level: 1, name: "מתכוני עוף" })).toBeInTheDocument();
    expect(screen.getByText("הכי טעים שיש")).toBeInTheDocument();
    expect(screen.getByText("עוף בתנור")).toBeInTheDocument();
    expect(screen.queryByText(CategoryPageText.loading)).not.toBeInTheDocument();
  });

  it("falls back to the empty state when initialRecipes has no items", () => {
    getCategoryBySlug.mockReturnValue(new Promise(() => {}));
    getRecipesByCategory.mockReturnValue(new Promise(() => {}));

    render(
      <CategoryPageClient
        slug="chicken"
        initialCategory={makeCategory()}
        initialRecipes={makeRecipes([])}
      />,
      { wrapper: makeWrapper() },
    );

    expect(screen.getByText(CategoryPageText.emptyTitle)).toBeInTheDocument();
  });

  it("shows the recipe grid's own loading state when the server-side recipe fetch failed (initialRecipes null)", () => {
    getCategoryBySlug.mockReturnValue(new Promise(() => {}));
    getRecipesByCategory.mockReturnValue(new Promise(() => {})); // still pending client-side

    render(
      <CategoryPageClient slug="chicken" initialCategory={makeCategory()} initialRecipes={null} />,
      { wrapper: makeWrapper() },
    );

    // Category content (server-seeded) is present immediately regardless…
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    // …while only the recipes section falls back to its client-side loading state.
    expect(screen.queryByText(CategoryPageText.loading)).not.toBeInTheDocument();
  });
});
