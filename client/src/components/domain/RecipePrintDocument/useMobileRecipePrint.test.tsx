import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, render } from "@testing-library/react";
import type { Recipe } from "@/types/domain";
import { useMobileRecipePrint } from "./useMobileRecipePrint";

const PAGE_STYLE = "@page { size: A4 } .marker-from-page-style {}";

function makeRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: "rec-1",
    title: "עוגת שוקולד",
    slug: "chocolate-cake",
    image: null,
    categories: [],
    tags: [],
    servings: null,
    prepTime: null,
    totalTime: null,
    difficulty: null,
    description: null,
    ingredientSections: [{ title: null, ingredients: [] }],
    preparationSections: [{ title: null, steps: [] }],
    tips: [],
    specialEquipment: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function Harness({ recipe, onReady }: { recipe: Recipe; onReady: (start: () => void) => void }) {
  const { startPrint, printPortal } = useMobileRecipePrint(recipe, PAGE_STYLE);
  onReady(startPrint);
  return <>{printPortal}</>;
}

const styleTag = () => document.head.querySelector('style[data-nemesh-recipe-print="style"]');
const portalHost = () => document.body.querySelector('[data-nemesh-recipe-print="host"]');

let printSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  printSpy = vi.spyOn(window, "print").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  document.title = "";
});

/** Runs `start()` and lets the deferred print timer + image-decode await settle. */
async function flushPrint(start: () => void) {
  await act(async () => {
    start();
  });
  await act(async () => {
    await new Promise((r) => setTimeout(r, 80));
  });
}

describe("useMobileRecipePrint", () => {
  it("renders nothing until startPrint is called", () => {
    let start = () => {};
    render(<Harness recipe={makeRecipe()} onReady={(s) => (start = s)} />);
    expect(styleTag()).toBeNull();
    expect(portalHost()).toBeNull();
    expect(start).toBeTypeOf("function");
  });

  it("on startPrint: injects the scoped stylesheet, portals the document into <body>, and calls window.print", async () => {
    let start = () => {};
    render(
      <Harness
        recipe={makeRecipe({ title: "טארט לימון" })}
        onReady={(s) => (start = s)}
      />,
    );

    await flushPrint(start);

    const tag = styleTag();
    expect(tag).not.toBeNull();
    // Carries the page-level rules…
    expect(tag!.textContent).toContain(".marker-from-page-style");
    // …and the rule that hides every other top-level node while printing.
    expect(tag!.textContent).toContain(
      'body > *:not([data-nemesh-recipe-print="host"]) { display: none !important; }',
    );

    const host = portalHost();
    expect(host).not.toBeNull();
    expect(host!.parentElement).toBe(document.body);
    // The real print document rendered inside the portal.
    expect(host!.querySelector("h1")?.textContent).toBe("טארט לימון");
    expect(document.title).toBe("טארט לימון");

    expect(printSpy).toHaveBeenCalledTimes(1);
  });

  it("tears everything down and restores the title on afterprint", async () => {
    document.title = "original";
    let start = () => {};
    render(
      <Harness recipe={makeRecipe({ title: "עוגה" })} onReady={(s) => (start = s)} />,
    );

    await flushPrint(start);
    expect(styleTag()).not.toBeNull();
    expect(portalHost()).not.toBeNull();

    await act(async () => {
      window.dispatchEvent(new Event("afterprint"));
    });

    expect(styleTag()).toBeNull();
    expect(portalHost()).toBeNull();
    expect(document.title).toBe("original");
  });
});
