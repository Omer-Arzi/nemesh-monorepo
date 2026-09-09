import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithTheme as render } from "@/test/renderWithTheme";
import PrintRecipeButton from "./PrintRecipeButton";
import { PrintRecipeButtonText } from "./PrintRecipeButton.consts";

describe("PrintRecipeButton", () => {
  it("renders a button whose accessible name is the visible label", () => {
    render(<PrintRecipeButton onClick={() => {}} />);
    const button = screen.getByRole("button", { name: PrintRecipeButtonText.label });
    expect(button).toBeInTheDocument();
  });

  it("calls onClick when activated (with no arguments)", () => {
    const onClick = vi.fn();
    render(<PrintRecipeButton onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith();
  });

  it("hides the decorative start icon from assistive technology", () => {
    const { container } = render(<PrintRecipeButton onClick={() => {}} />);
    const icon = container.querySelector("svg");
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });
});
