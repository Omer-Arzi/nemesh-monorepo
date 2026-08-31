import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithTheme as render } from "@/test/renderWithTheme";
import type { SpecialEquipmentItem } from "@/types/domain";
import RecipeSpecialEquipmentSection from "./RecipeSpecialEquipmentSection";

describe("RecipeSpecialEquipmentSection", () => {
  it("renders nothing when equipment is empty (old recipe / new recipe with no items)", () => {
    const { container } = render(<RecipeSpecialEquipmentSection equipment={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when every item is blank or whitespace-only", () => {
    const blank: SpecialEquipmentItem[] = [{ name: "" }, { name: "   " }];
    const { container } = render(<RecipeSpecialEquipmentSection equipment={blank} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the title and a single item", () => {
    render(<RecipeSpecialEquipmentSection equipment={[{ name: "מד חום" }]} />);
    expect(screen.getByText("כלים מיוחדים")).toBeInTheDocument();
    expect(screen.getByText("מד חום")).toBeInTheDocument();
  });

  it("renders several items", () => {
    const equipment: SpecialEquipmentItem[] = [
      { name: "סיפון" },
      { name: "פיפטה" },
      { name: "מבער מטבח" },
    ];
    render(<RecipeSpecialEquipmentSection equipment={equipment} />);
    expect(screen.getByText("סיפון")).toBeInTheDocument();
    expect(screen.getByText("פיפטה")).toBeInTheDocument();
    expect(screen.getByText("מבער מטבח")).toBeInTheDocument();
  });

  it("drops blank items while keeping valid ones", () => {
    const equipment: SpecialEquipmentItem[] = [{ name: "  " }, { name: "מד חום" }, { name: "" }];
    const { container } = render(<RecipeSpecialEquipmentSection equipment={equipment} />);
    expect(container.querySelectorAll(".MuiChip-root")).toHaveLength(1);
    expect(screen.getByText("מד חום")).toBeInTheDocument();
  });
});
