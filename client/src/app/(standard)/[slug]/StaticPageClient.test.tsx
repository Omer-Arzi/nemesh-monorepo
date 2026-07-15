import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Page } from "@/types/domain";
import StaticPageClient from "./StaticPageClient";

function makePage(overrides: Partial<Page>): Page {
  return {
    id: "1",
    title: "מה מיוחד בנמש?",
    slug: "nemsh-special",
    summary: null,
    content: [],
    ...overrides,
  };
}

describe("StaticPageClient", () => {
  it("does not render a body heading that duplicates the page title", () => {
    // Regression test: a heading block whose text matches the dedicated
    // title field (a common CMS authoring artifact — title pasted into both
    // the title field and the rich-text body) previously rendered twice.
    const page = makePage({
      content: [
        {
          type: "heading",
          level: 1,
          children: [{ type: "text", text: "מה מיוחד בנמש?" }],
        },
        {
          type: "paragraph",
          children: [{ type: "text", text: "תוכן הדף." }],
        },
      ],
    });

    render(<StaticPageClient page={page} />);

    expect(screen.getAllByText("מה מיוחד בנמש?")).toHaveLength(1);
    expect(screen.getByText("תוכן הדף.")).toBeInTheDocument();
  });

  it("still renders a body heading whose text differs from the page title", () => {
    const page = makePage({
      content: [
        {
          type: "heading",
          level: 2,
          children: [{ type: "text", text: "מוד בישול" }],
        },
      ],
    });

    render(<StaticPageClient page={page} />);

    expect(screen.getByRole("heading", { level: 2, name: "מוד בישול" })).toBeInTheDocument();
  });
});
