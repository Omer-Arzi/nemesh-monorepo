import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithTheme as render } from "@/test/renderWithTheme";
import RecipeMeta from "./RecipeMeta";

describe("RecipeMeta", () => {
  it("renders nothing when every stat is null (old recipe with no data at all)", () => {
    const { container } = render(<RecipeMeta prepTime={null} servings={null} difficulty={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("existing recipe with prepTime shows it as work time (e.g. '45 דקות עבודה')", () => {
    render(<RecipeMeta prepTime={45} servings={null} difficulty={null} />);
    expect(screen.getByText("45 דקות עבודה")).toBeInTheDocument();
  });

  it("no prepTime renders no time item, even though other stats still show", () => {
    render(<RecipeMeta prepTime={null} servings={4} difficulty="easy" />);
    expect(screen.queryByText(/עבודה/)).not.toBeInTheDocument();
    expect(screen.getByText("4 מנות")).toBeInTheDocument();
  });

  it("exactly one time icon renders when prepTime is set", () => {
    const { container } = render(<RecipeMeta prepTime={45} servings={null} difficulty={null} />);
    expect(container.querySelectorAll("svg")).toHaveLength(1);
  });

  it("prepTime of 0 is treated as a real value, not omitted (0 !== null)", () => {
    render(<RecipeMeta prepTime={0} servings={null} difficulty={null} />);
    expect(screen.getByText("0 דקות עבודה")).toBeInTheDocument();
  });

  it("servings and difficulty are unaffected", () => {
    render(<RecipeMeta prepTime={45} servings={4} difficulty="easy" />);
    expect(screen.getByText("4 מנות")).toBeInTheDocument();
  });
});
