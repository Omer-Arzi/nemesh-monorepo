import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithTheme as render } from "@/test/renderWithTheme";
import type { AboutPage } from "@/types/domain";
import AboutIntro from "./AboutIntro";

function makeAbout(overrides: Partial<AboutPage> = {}): AboutPage {
  return {
    eyebrow: "אודות נמש",
    title: "כמה מילים על נמש",
    content: [{ type: "paragraph", children: [{ type: "text", text: "תוכן לדוגמה." }] }],
    primaryImage: { url: "/uploads/primary.jpg", alt: "תמונה ראשונה", width: 800, height: 1000 },
    secondaryImage: { url: "/uploads/secondary.jpg", alt: "תמונה שנייה", width: 800, height: 1000 },
    ...overrides,
  };
}

describe("AboutIntro", () => {
  it("renders the title as the page's single H1, outside the rich-text body", () => {
    render(<AboutIntro about={makeAbout()} />);

    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent("כמה מילים על נמש");
  });

  it("still renders exactly one H1 when title is absent", () => {
    render(<AboutIntro about={makeAbout({ eyebrow: "אודות נמש", title: null })} />);

    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
  });

  it("renders the eyebrow when present", () => {
    render(<AboutIntro about={makeAbout({ eyebrow: "אודות נמש" })} />);
    expect(screen.getByText("אודות נמש")).toBeInTheDocument();
  });

  it("omits the eyebrow cleanly when absent", () => {
    render(<AboutIntro about={makeAbout({ eyebrow: null })} />);
    expect(screen.queryByText("אודות נמש")).not.toBeInTheDocument();
  });

  it("renders rich-text content via BlockRenderer", () => {
    render(
      <AboutIntro
        about={makeAbout({
          content: [
            { type: "heading", level: 4, children: [{ type: "text", text: "כותרת פנימית" }] },
            { type: "paragraph", children: [{ type: "text", text: "פסקה רגילה." }] },
          ],
        })}
      />
    );

    expect(screen.getByRole("heading", { level: 4, name: "כותרת פנימית" })).toBeInTheDocument();
    expect(screen.getByText("פסקה רגילה.")).toBeInTheDocument();
  });
});
