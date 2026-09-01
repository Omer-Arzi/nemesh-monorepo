import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithTheme as render } from "@/test/renderWithTheme";
import type { RecipeSummary } from "@/types/domain";
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

describe("RecipeCard — small variant time display", () => {
  it("'החמין של עומר' (1h prep, 12h total) shows only work time — totalTime is never shown on cards", () => {
    render(<RecipeCard recipe={BASE} small />);
    expect(screen.getByText(/שעה עבודה/)).toBeInTheDocument();
    expect(screen.queryByText(/12 שעות/)).not.toBeInTheDocument();
    expect(screen.queryByText(/סה״כ/)).not.toBeInTheDocument();
  });

  it("a recipe with only prepTime shows it as work time", () => {
    render(<RecipeCard recipe={{ ...BASE, totalTime: null, prepTime: 45 }} small />);
    expect(screen.getByText(/45 דקות עבודה/)).toBeInTheDocument();
  });

  it("missing prepTime shows no time text, even when totalTime exists", () => {
    render(<RecipeCard recipe={{ ...BASE, prepTime: null, totalTime: 720 }} small />);
    expect(screen.queryByText(/עבודה|סה״כ|שעות|דקות/)).not.toBeInTheDocument();
  });
});
