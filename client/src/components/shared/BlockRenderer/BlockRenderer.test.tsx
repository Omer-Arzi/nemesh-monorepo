import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithTheme as render } from "@/test/renderWithTheme";
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
    // h2/h3 weight is unchanged from before (theme's own h2/h3 weight is
    // already 700) — only h4/h5/h6 become calmer relative to it.
    expect(heading).toHaveStyle({ fontSize: BlockRendererStyle.headingFontSize[2], fontWeight: "700" });
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

  it("renders an explicit H4 as a real <h4> at the restrained About/content-page size", () => {
    render(
      <BlockRenderer
        blocks={[{ type: "heading", level: 4, children: [{ type: "text", text: "כותרת משנה" }] }]}
      />
    );

    const heading = screen.getByRole("heading", { level: 4, name: "כותרת משנה" });
    expect(heading.tagName).toBe("H4");
    expect(heading).toHaveStyle({
      fontSize: BlockRendererStyle.headingFontSize[4],
      fontWeight: "600", // theme's h4 weight — deliberately calmer than h2/h3's 700
    });
  });

  it("renders an explicit H5 as a real <h5>, smaller and calmer than H4", () => {
    render(
      <BlockRenderer
        blocks={[{ type: "heading", level: 5, children: [{ type: "text", text: "נושא קטן" }] }]}
      />
    );

    const heading = screen.getByRole("heading", { level: 5, name: "נושא קטן" });
    expect(heading.tagName).toBe("H5");
    expect(heading).toHaveStyle({ fontSize: BlockRendererStyle.headingFontSize[5] });
  });

  it("never promotes a bold paragraph to a heading regardless of level", () => {
    // Regression guard: only an explicit block.type === "heading" node may
    // render as a heading element — bold marks on a paragraph must never be
    // treated as an implicit H3 (or any other level).
    render(
      <BlockRenderer
        blocks={[
          {
            type: "paragraph",
            children: [{ type: "text", text: "פסקה מודגשת בלבד", bold: true }],
          },
          { type: "heading", level: 3, children: [{ type: "text", text: "כותרת אמיתית" }] },
        ]}
      />
    );

    const headings = screen.getAllByRole("heading");
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent("כותרת אמיתית");
  });
});
