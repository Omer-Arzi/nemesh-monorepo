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
//
// Mirrors the real hook's reference behavior: a STABLE array while enabled
// (>= 2 typed chars), and a BRAND-NEW empty array on every render while
// disabled (empty/short query). The latter is the condition that broke
// recommended-mode keyboard nav — a stable `[]` here would hide the bug.
let mockSuggestions: SearchSuggestion[] = [];
vi.mock("./useSearchSuggestions", () => ({
  useSearchSuggestions: (query: string) => {
    const enabled = query.trim().length >= 2;
    return { suggestions: enabled ? mockSuggestions : [], isActive: enabled };
  },
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

const RECOMMENDED_TAGS = [
  { name: "ארוחות ערב מהירות", slug: "quick-dinners" },
  { name: "מתכונים לשבת", slug: "shabbat" },
  { name: "קינוחים בלי אפייה", slug: "no-bake-desserts" },
];

// jsdom-friendly stand-in for the wrapper blur event: focus moved entirely
// outside the search wrapper (relatedTarget not contained).
const blurredOutEvent = {
  currentTarget: { contains: () => false },
  relatedTarget: null,
} as unknown as React.FocusEvent<HTMLDivElement>;

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

describe("useHomeSearch — hero recommended-tags mode", () => {
  beforeEach(() => {
    push.mockClear();
    mockSuggestions = [];
  });

  const renderHero = (tags = RECOMMENDED_TAGS) =>
    renderHook(() => useHomeSearch({ recommendedTags: tags, mode: "hero" }));

  it("does not show the recommended state until the field is focused", () => {
    const { result } = renderHero();
    expect(result.current.isRecommendedOpen).toBe(false);
    expect(result.current.isOpen).toBe(false);

    act(() => result.current.handleFocus());
    expect(result.current.isRecommendedOpen).toBe(true);
    expect(result.current.isOpen).toBe(true);
  });

  it("does not enter the recommended state when there are no qualifying tags", () => {
    const { result } = renderHero([]);
    act(() => result.current.handleFocus());
    expect(result.current.isRecommendedOpen).toBe(false);
  });

  it("exits the recommended state on the first typed character and re-enters when cleared back to empty (D4)", () => {
    const { result } = renderHero();
    act(() => result.current.handleFocus());
    expect(result.current.isRecommendedOpen).toBe(true);

    act(() => result.current.setQuery(" ")); // even a space counts as typing
    expect(result.current.isRecommendedOpen).toBe(false);

    act(() => result.current.setQuery(""));
    expect(result.current.isRecommendedOpen).toBe(true);
  });

  it("Escape keeps the recommended state dismissed while focus + empty query persist (D8), re-armed by a query change", () => {
    const { result } = renderHero();
    act(() => result.current.handleFocus());
    act(() =>
      result.current.handleKeyDown({ key: "Escape", preventDefault: vi.fn() } as unknown as React.KeyboardEvent)
    );
    expect(result.current.isRecommendedOpen).toBe(false);

    // still focused, still empty — stays dismissed
    act(() => result.current.handleFocus());
    expect(result.current.isRecommendedOpen).toBe(false);

    // any query change re-arms it (typing then clearing)
    act(() => result.current.setQuery("a"));
    act(() => result.current.setQuery(""));
    expect(result.current.isRecommendedOpen).toBe(true);
  });

  it("blur clears both focus and the Escape dismissal", () => {
    const { result } = renderHero();
    act(() => result.current.handleFocus());
    act(() =>
      result.current.handleKeyDown({ key: "Escape", preventDefault: vi.fn() } as unknown as React.KeyboardEvent)
    );
    act(() => result.current.handleWrapperBlur(blurredOutEvent));

    act(() => result.current.handleFocus());
    expect(result.current.isRecommendedOpen).toBe(true);
  });

  it("ArrowDown/ArrowUp move the highlight and activeDescendantId across renders (regression: reset-effect churn)", () => {
    const { result } = renderHero();
    act(() => result.current.handleFocus());

    act(() =>
      result.current.handleKeyDown({ key: "ArrowDown", preventDefault: vi.fn() } as unknown as React.KeyboardEvent)
    );
    expect(result.current.activeIndex).toBe(0);
    expect(result.current.activeDescendantId).toMatch(/-option-0$/);

    act(() =>
      result.current.handleKeyDown({ key: "ArrowDown", preventDefault: vi.fn() } as unknown as React.KeyboardEvent)
    );
    expect(result.current.activeIndex).toBe(1);
    expect(result.current.activeDescendantId).toMatch(/-option-1$/);

    act(() =>
      result.current.handleKeyDown({ key: "ArrowUp", preventDefault: vi.fn() } as unknown as React.KeyboardEvent)
    );
    expect(result.current.activeIndex).toBe(0);
  });

  it("ArrowDown then Enter routes to the tag-filter results view by slug — never a q= search", () => {
    const { result } = renderHero();
    act(() => result.current.handleFocus());
    act(() =>
      result.current.handleKeyDown({ key: "ArrowDown", preventDefault: vi.fn() } as unknown as React.KeyboardEvent)
    );
    expect(result.current.activeIndex).toBe(0);
    act(() =>
      result.current.handleKeyDown({ key: "Enter", preventDefault: vi.fn() } as unknown as React.KeyboardEvent)
    );
    expect(push).toHaveBeenCalledWith("/results?tag=quick-dinners");
  });

  it("ArrowDown is clamped to the number of recommended tags", () => {
    const { result } = renderHero();
    act(() => result.current.handleFocus());
    for (let i = 0; i < 10; i++) {
      act(() =>
        result.current.handleKeyDown({ key: "ArrowDown", preventDefault: vi.fn() } as unknown as React.KeyboardEvent)
      );
    }
    expect(result.current.activeIndex).toBe(RECOMMENDED_TAGS.length - 1);
  });

  it("selectRecommendedTag routes to the tag-filter results view by slug", () => {
    const { result } = renderHero();
    act(() => result.current.selectRecommendedTag(RECOMMENDED_TAGS[1]));
    expect(push).toHaveBeenCalledWith("/results?tag=shabbat");
  });

  it("Enter with nothing highlighted in the recommended state does not navigate", () => {
    const { result } = renderHero();
    act(() => result.current.handleFocus());
    act(() =>
      result.current.handleKeyDown({ key: "Enter", preventDefault: vi.fn() } as unknown as React.KeyboardEvent)
    );
    expect(push).not.toHaveBeenCalled();
  });
});

describe("useHomeSearch — compact mode never enters recommended state (D3)", () => {
  beforeEach(() => {
    push.mockClear();
    mockSuggestions = [];
  });

  it("focus does nothing in the default (compact) mode even if tags are somehow passed", () => {
    const { result } = renderHook(() => useHomeSearch({ recommendedTags: RECOMMENDED_TAGS }));
    act(() => result.current.handleFocus());
    expect(result.current.isRecommendedOpen).toBe(false);
    expect(result.current.isOpen).toBe(false);
  });
});
