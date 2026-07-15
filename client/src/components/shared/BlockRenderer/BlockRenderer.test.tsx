import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import BlockRenderer from "./BlockRenderer";
import { BlockRendererStyle } from "./BlockRenderer.style";

describe("BlockRenderer", () => {
  it("renders a heading block as a real semantic heading at a restrained size", () => {
    render(
      <BlockRenderer
        blocks={[
          { type: "heading", level: 2, children: [{ type: "text", text: "מוד בישול" }] },
        ]}
      />
    );

    const heading = screen.getByRole("heading", { level: 2, name: "מוד בישול" });
    expect(heading.tagName).toBe("H2");
    expect(heading).toHaveStyle({ fontSize: BlockRendererStyle.headingFontSize[2] });
  });

  it("renders bold text in a paragraph as inline bold, not a heading", () => {
    render(
      <BlockRenderer
        blocks={[
          {
            type: "paragraph",
            children: [{ type: "text", text: "המרכיבים תמיד זמינים", bold: true }],
          },
        ]}
      />
    );

    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    const strong = screen.getByText("המרכיבים תמיד זמינים");
    expect(strong.tagName).toBe("STRONG");
    expect(strong.closest("p")).not.toBeNull();
  });
});
