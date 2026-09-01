import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { SearchSuggestion } from "@/lib/api/services/suggestionsService";
import { resolveExactSuggestion, useHomeSearch } from "./useHomeSearch";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

// Controlled from each test via `mockSuggestions` — avoids exercising the
// real debounce/TanStack Query machinery for hook-level behavior tests.
let mockSuggestions: SearchSuggestion[] = [];
vi.mock("./useSearchSuggestions", () => ({
  useSearchSuggestions: () => ({ suggestions: mockSuggestions, isActive: true }),
}));

const SHALLOT: SearchSuggestion = {
  type: "ingredient",
  matchType: "variant",
  label: "שאלוט",
  subtitle: "מתכונים עם שאלוט",
  searchTerm: "שאלוט",
  canonicalId: "ingredient-onion",
  canonicalName: "בצל",
  score: 100,
};

const ONION_PARENT: SearchSuggestion = {
  type: "ingredient",
  matchType: "canonical-parent",
  label: "בצל",
  subtitle: "חיפוש רחב יותר: מתכונים עם בצל",
  searchTerm: "בצל",
  canonicalId: "ingredient-onion",
  canonicalName: "בצל",
  score: 85,
};

const ONION_CANONICAL: SearchSuggestion = {
  type: "ingredient",
  matchType: "canonical",
  label: "בצל",
  subtitle: "מתכונים עם בצל",
  searchTerm: "בצל",
  canonicalId: "ingredient-onion",
  canonicalName: "בצל",
  score: 90,
};

const PARTIAL: SearchSuggestion = {
  type: "ingredient",
  matchType: "partial",
  label: "שאלוט קצוץ",
  subtitle: "מתכונים עם שאלוט קצוץ",
  searchTerm: "שאלוט קצוץ",
  canonicalId: "ingredient-onion",
  canonicalName: "בצל",
  score: 40,
};

const RECIPE: SearchSuggestion = {
  type: "recipe",
  label: "מרק בצל צרפתי",
  subtitle: "מתכון",
  slug: "french-onion-soup",
  score: 8,
};

describe("resolveExactSuggestion", () => {
  it("returns the exact variant suggestion", () => {
    expect(resolveExactSuggestion("שאלוט", [SHALLOT, ONION_PARENT])).toBe(SHALLOT);
  });

  it("returns the exact canonical suggestion when no variant is present", () => {
    expect(resolveExactSuggestion("בצל", [ONION_CANONICAL, RECIPE])).toBe(ONION_CANONICAL);
  });

  it("prefers the exact variant over an exact canonical match when both have the same label", () => {
    // Contrived but possible: two different catalog rows each exactly match
    // the same query text — one as its canonical name, one as a variant.
    const sameTextCanonical: SearchSuggestion = { ...ONION_CANONICAL, label: "שאלוט", searchTerm: "שאלוט" };
    expect(resolveExactSuggestion("שאלוט", [sameTextCanonical, SHALLOT])).toBe(SHALLOT);
  });

  it("ignores canonical-parent and partial matches even when the label equals the query", () => {
    // ONION_PARENT's label is "בצל" but its matchType is canonical-parent, not canonical —
    // only a real exact-match matchType should resolve here.
    expect(resolveExactSuggestion("בצל", [ONION_PARENT])).toBeUndefined();
    expect(resolveExactSuggestion("שאלוט קצוץ", [PARTIAL])).toBeUndefined();
  });

  it("returns undefined for an unknown/non-exact term (free-text fallback case)", () => {
    expect(resolveExactSuggestion("עגבניה", [SHALLOT, ONION_PARENT, RECIPE])).toBeUndefined();
  });

  it("returns undefined when suggestions are stale relative to the full query (debounce race guard)", () => {
    // Simulates: user typed "שא" (suggestions still loading/stale for that
    // shorter text) then kept typing to "שאלוט" and hit Enter immediately.
    const staleSuggestion: SearchSuggestion = { ...SHALLOT, label: "שא", searchTerm: "שא" };
    expect(resolveExactSuggestion("שאלוט", [staleSuggestion])).toBeUndefined();
  });

  it("returns undefined for an empty/whitespace query", () => {
    expect(resolveExactSuggestion("   ", [SHALLOT])).toBeUndefined();
  });
});

describe("useHomeSearch", () => {
  beforeEach(() => {
    push.mockClear();
    mockSuggestions = [];
  });

  it("handleSelect on an exact variant suggestion performs the narrow search", () => {
    const { result } = renderHook(() => useHomeSearch());
    act(() => result.current.handleSelect(SHALLOT));
    expect(push).toHaveBeenCalledWith("/results?ingredient=%D7%A9%D7%90%D7%9C%D7%95%D7%98");
  });

  it("handleSelect on the canonical-parent suggestion performs the broad canonical search", () => {
    const { result } = renderHook(() => useHomeSearch());
    act(() => result.current.handleSelect(ONION_PARENT));
    expect(push).toHaveBeenCalledWith("/results?canonicalIngredient=%D7%91%D7%A6%D7%9C");
  });

  it("handleSelect on an exact canonical suggestion performs the broad canonical search", () => {
    const { result } = renderHook(() => useHomeSearch());
    act(() => result.current.handleSelect(ONION_CANONICAL));
    expect(push).toHaveBeenCalledWith("/results?canonicalIngredient=%D7%91%D7%A6%D7%9C");
  });

  it("handleSelect on a partial ingredient match performs the narrow search on the matched text", () => {
    const { result } = renderHook(() => useHomeSearch());
    act(() => result.current.handleSelect(PARTIAL));
    expect(push).toHaveBeenCalledWith(expect.stringContaining("/results?ingredient="));
  });

  it("handleSelect on a recipe suggestion navigates to the recipe page", () => {
    const { result } = renderHook(() => useHomeSearch());
    act(() => result.current.handleSelect(RECIPE));
    expect(push).toHaveBeenCalledWith("/recipes/french-onion-soup");
  });

  it("submitting the exact variant text with nothing highlighted behaves like selecting the variant", () => {
    mockSuggestions = [SHALLOT, ONION_PARENT];
    const { result } = renderHook(() => useHomeSearch());
    act(() => result.current.setQuery("שאלוט"));

    const preventDefault = vi.fn();
    act(() => result.current.handleSubmit({ preventDefault } as unknown as React.FormEvent));

    expect(preventDefault).toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith("/results?ingredient=%D7%A9%D7%90%D7%9C%D7%95%D7%98");
  });

  it("submitting an unknown/non-exact term falls back to free-text search", () => {
    mockSuggestions = [];
    const { result } = renderHook(() => useHomeSearch());
    act(() => result.current.setQuery("עגבניה צהובה"));

    const preventDefault = vi.fn();
    act(() => result.current.handleSubmit({ preventDefault } as unknown as React.FormEvent));

    expect(push).toHaveBeenCalledWith(expect.stringContaining("/results?q="));
    expect(push).not.toHaveBeenCalledWith(expect.stringContaining("ingredient="));
  });

  it("Arrow Down highlights the first suggestion, then Enter selects the highlighted one — not the exact-match text", () => {
    // Query text exactly matches the variant "שאלוט", but the user explicitly
    // arrows down to the canonical-parent option ("בצל") before pressing
    // Enter — the highlighted suggestion must win over the exact-match rule.
    mockSuggestions = [SHALLOT, ONION_PARENT];
    const { result } = renderHook(() => useHomeSearch());
    act(() => result.current.setQuery("שאלוט"));
    act(() => result.current.setOpen(true));

    const preventDefault = vi.fn();
    act(() =>
      result.current.handleKeyDown({
        key: "ArrowDown",
        preventDefault,
      } as unknown as React.KeyboardEvent)
    );
    act(() =>
      result.current.handleKeyDown({
        key: "ArrowDown",
        preventDefault,
      } as unknown as React.KeyboardEvent)
    );
    act(() => result.current.handleKeyDown({ key: "Enter", preventDefault } as unknown as React.KeyboardEvent));

    expect(push).toHaveBeenCalledWith("/results?canonicalIngredient=%D7%91%D7%A6%D7%9C");
  });

  it("Escape closes the dropdown and clears the highlighted index", () => {
    mockSuggestions = [SHALLOT];
    const { result } = renderHook(() => useHomeSearch());
    act(() => result.current.setQuery("שאלוט"));
    act(() => result.current.setOpen(true));
    act(() =>
      result.current.handleKeyDown({ key: "ArrowDown", preventDefault: vi.fn() } as unknown as React.KeyboardEvent)
    );
    expect(result.current.activeIndex).toBe(0);

    act(() => result.current.handleKeyDown({ key: "Escape", preventDefault: vi.fn() } as unknown as React.KeyboardEvent));
    expect(result.current.open).toBe(false);
    expect(result.current.activeIndex).toBe(-1);
  });
});
