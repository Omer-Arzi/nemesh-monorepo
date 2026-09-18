import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithTheme as render } from "@/test/renderWithTheme";
import type { Category, RecipeSummary, Tag } from "@/types/domain";
import RecipeCard from "./RecipeCard";

const BASE: RecipeSummary = {
  id: "recipe-1",
  title: "החמין של עומר",
  slug: "hchmyn-shl-avmr",
  image: null,
  categories: [],
  tags: [],
  difficulty: null,
  prepTime: 60,
  totalTime: 720,
  servings: null,
};

const makeCategory = (n: number): Category => ({
  id: `cat-${n}`,
  name: `קטגוריה ${n}`,
  menuName: null,
  slug: `cat-${n}`,
  description: null,
  image: null,
});

const makeTag = (n: number): Tag => ({
  id: `tag-${n}`,
  name: `תג ${n}`,
  slug: `tag-${n}`,
  description: null,
  image: null,
});

describe("RecipeCard — small variant time display", () => {
  it("'החמין של עומר' (1h prep, 12h total) shows only work time — totalTime is never shown on cards", () => {
    render(<RecipeCard recipe={BASE} small />);
    expect(screen.getByText(/שעה עבודה/)).toBeInTheDocument();
    expect(screen.queryByText(/12 שעות/)).not.toBeInTheDocument();
    expect(screen.queryByText(/סה״כ/)).not.toBeInTheDocument();
  });

  it("a recipe with only prepTime shows it as work time, abbreviated on cards", () => {
    render(<RecipeCard recipe={{ ...BASE, totalTime: null, prepTime: 45 }} small />);
    expect(screen.getByText(/45 דק׳ עבודה/)).toBeInTheDocument();
  });

  it("missing prepTime shows no time text, even when totalTime exists", () => {
    render(<RecipeCard recipe={{ ...BASE, prepTime: null, totalTime: 720 }} small />);
    expect(screen.queryByText(/עבודה|סה״כ|שעות|דקות/)).not.toBeInTheDocument();
  });

  it("caps categories and tags at 3 each in the joined line (RelatedRecipes' unbounded-join bug)", () => {
    render(
      <RecipeCard
        recipe={{
          ...BASE,
          categories: [1, 2, 3, 4, 5].map(makeCategory),
          tags: [1, 2, 3, 4, 5].map(makeTag),
        }}
        small
      />,
    );
    expect(screen.getByText(/קטגוריה 1/)).toBeInTheDocument();
    expect(screen.getByText(/קטגוריה 3/)).toBeInTheDocument();
    expect(screen.queryByText(/קטגוריה 4/)).not.toBeInTheDocument();
    expect(screen.queryByText(/קטגוריה 5/)).not.toBeInTheDocument();
    expect(screen.getByText(/תג 3/)).toBeInTheDocument();
    expect(screen.queryByText(/תג 4/)).not.toBeInTheDocument();
  });
});

describe("RecipeCard — reserved content-height zones (default variant)", () => {
  it("always renders exactly 4 content zones (title, meta, categories, tags), even with no categories, tags, or stats", () => {
    const { container } = render(
      <RecipeCard
        recipe={{ ...BASE, categories: [], tags: [], prepTime: null, servings: null, difficulty: null }}
      />,
    );
    const content = container.querySelector(".MuiCardContent-root");
    expect(content?.children).toHaveLength(4);
  });

  it("still renders all 4 zones when categories, tags, and stats are all populated", () => {
    const { container } = render(
      <RecipeCard
        recipe={{
          ...BASE,
          categories: [1, 2].map(makeCategory),
          tags: [1].map(makeTag),
          servings: 4,
          difficulty: "easy",
        }}
      />,
    );
    const content = container.querySelector(".MuiCardContent-root");
    expect(content?.children).toHaveLength(4);
  });

  it("a recipe with no categories renders an empty categories zone, not a missing one", () => {
    const { container } = render(<RecipeCard recipe={{ ...BASE, categories: [] }} />);
    const content = container.querySelector(".MuiCardContent-root");
    // zones in DOM order: title(0), meta(1), categories(2), tags(3)
    const categoriesZone = content?.children[2];
    expect(categoriesZone).toBeInTheDocument();
    expect(categoriesZone?.querySelectorAll(".MuiChip-root")).toHaveLength(0);
  });

  it("a recipe with no tags renders an empty tags zone, not a missing one", () => {
    const { container } = render(<RecipeCard recipe={{ ...BASE, tags: [] }} />);
    const content = container.querySelector(".MuiCardContent-root");
    const tagsZone = content?.children[3];
    expect(tagsZone).toBeInTheDocument();
    expect(tagsZone?.querySelectorAll(".MuiChip-root")).toHaveLength(0);
  });
});
