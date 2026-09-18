import { describe, it, expect } from "vitest";
import { stripMarkdownToPlainText, truncateAtWordBoundary } from "./textUtils";

describe("stripMarkdownToPlainText", () => {
  it("returns an empty string for empty/null-ish input", () => {
    expect(stripMarkdownToPlainText("")).toBe("");
  });

  it("strips bold markers", () => {
    expect(stripMarkdownToPlainText("mix **well** before baking")).toBe(
      "mix well before baking",
    );
  });

  it("strips asterisk and underscore italic markers", () => {
    expect(stripMarkdownToPlainText("a *light* dusting of _flour_")).toBe(
      "a light dusting of flour",
    );
  });

  it("strips inline code markers", () => {
    expect(stripMarkdownToPlainText("set the oven to `180C`")).toBe(
      "set the oven to 180C",
    );
  });

  it("converts a markdown link to its visible text, dropping the URL", () => {
    expect(
      stripMarkdownToPlainText("see [the technique](https://example.com/tech) for details"),
    ).toBe("see the technique for details");
  });

  it("handles all constructs combined and leaves no markdown markers behind", () => {
    const result = stripMarkdownToPlainText(
      "**Bold**, *italic*, _also italic_, `code`, and a [link](https://x.test).",
    );
    expect(result).not.toMatch(/[*_`[\]()]/);
    expect(result).toBe("Bold, italic, also italic, code, and a link.");
  });

  it("collapses whitespace/newlines left behind by stripped syntax", () => {
    expect(stripMarkdownToPlainText("line one\n\nline **two**   here")).toBe(
      "line one line two here",
    );
  });
});

describe("truncateAtWordBoundary", () => {
  it("returns the original string unchanged when already within the limit", () => {
    expect(truncateAtWordBoundary("short text", 155)).toBe("short text");
  });

  it("truncates at the nearest word boundary and appends an ellipsis", () => {
    const text = "a".repeat(10) + " " + "b".repeat(10) + " " + "c".repeat(10);
    const result = truncateAtWordBoundary(text, 15);
    expect(result).toBe("aaaaaaaaaa…");
    expect(result.length).toBeLessThanOrEqual(16);
  });

  it("falls back to a hard cut when there is no earlier space", () => {
    const text = "a".repeat(30);
    expect(truncateAtWordBoundary(text, 10)).toBe("aaaaaaaaaa…");
  });
});
