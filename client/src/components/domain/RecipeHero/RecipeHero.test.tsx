import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithTheme as render } from "@/test/renderWithTheme";
import RecipeHero from "./RecipeHero";

const BASE = {
  title: "עוגת שוקולד",
  image: null,
  description: null,
  categories: [],
};

describe("RecipeHero — action slot", () => {
  it("renders the action alongside the metadata stats", () => {
    render(
      <RecipeHero
        {...BASE}
        prepTime={30}
        totalTime={null}
        servings={4}
        difficulty="easy"
        action={<button type="button">הדפסה</button>}
      />,
    );
    expect(screen.getByRole("button", { name: "הדפסה" })).toBeInTheDocument();
  });

  it("still renders the action when the hero has no metadata stats", () => {
    render(
      <RecipeHero
        {...BASE}
        prepTime={null}
        totalTime={null}
        servings={null}
        difficulty={null}
        action={<button type="button">הדפסה</button>}
      />,
    );
    expect(screen.getByRole("button", { name: "הדפסה" })).toBeInTheDocument();
  });

  it("renders no action affordance when none is passed", () => {
    render(
      <RecipeHero
        {...BASE}
        prepTime={30}
        totalTime={null}
        servings={4}
        difficulty="easy"
      />,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
