import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithTheme as render } from "@/test/renderWithTheme";
import type { RecipeIngredient } from "@/types/domain";
import IngredientList from "./IngredientList";

const BASE: RecipeIngredient = {
  ingredientName: "קמח",
  amount: 2,
  unit: "כוסות",
  note: null,
  preparationRecipe: null,
};

describe("IngredientList", () => {
  it("renders an old ingredient with no preparationRecipe as plain text (no relation, unchanged behavior)", () => {
    render(<IngredientList ingredients={[BASE]} />);
    expect(screen.getByText(/קמח/)).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders the ingredient name as an internal link when preparationRecipe is present", () => {
    const ingredients: RecipeIngredient[] = [
      {
        ingredientName: "ריבת לימון",
        amount: 2,
        unit: "כפות",
        note: null,
        preparationRecipe: { title: "ריבת לימון ביתית", slug: "ribat-limon" },
      },
    ];
    render(<IngredientList ingredients={ingredients} />);

    const link = screen.getByRole("link", { name: "למתכון: ריבת לימון, נפתח בכרטיסייה חדשה" });
    expect(link).toHaveAttribute("href", "/recipes/ribat-limon");
    // Opens in a new tab, with the rel protection new-tab links require.
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    // Amount/unit stay outside the link — only the name is the link.
    expect(link).toHaveTextContent("ריבת לימון");
    expect(screen.getByText(/כפות/)).toBeInTheDocument();
  });

  it("hides the decorative icon from assistive technology", () => {
    const ingredients: RecipeIngredient[] = [
      {
        ...BASE,
        preparationRecipe: { title: "ריבת לימון ביתית", slug: "ribat-limon" },
      },
    ];
    const { container } = render(<IngredientList ingredients={ingredients} />);
    const icon = container.querySelector("svg");
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });

  it("clicking the link in Cooking Mode does not also toggle the ingredient as completed", () => {
    const onToggle = vi.fn();
    const ingredients: RecipeIngredient[] = [
      {
        ...BASE,
        preparationRecipe: { title: "ריבת לימון ביתית", slug: "ribat-limon" },
      },
    ];
    render(
      <IngredientList
        ingredients={ingredients}
        cookingMode={{ isActive: true, checkedKeys: [], sectionIndex: 0, onToggle }}
      />
    );

    fireEvent.click(screen.getByRole("link"));
    expect(onToggle).not.toHaveBeenCalled();
  });

  it("clicking anywhere else on the row still toggles the ingredient in Cooking Mode", () => {
    const onToggle = vi.fn();
    const ingredients: RecipeIngredient[] = [
      {
        ...BASE,
        preparationRecipe: { title: "ריבת לימון ביתית", slug: "ribat-limon" },
      },
    ];
    render(
      <IngredientList
        ingredients={ingredients}
        cookingMode={{ isActive: true, checkedKeys: [], sectionIndex: 0, onToggle }}
      />
    );

    fireEvent.click(screen.getByText(/כוסות/));
    expect(onToggle).toHaveBeenCalledWith("0:0");
  });
});
