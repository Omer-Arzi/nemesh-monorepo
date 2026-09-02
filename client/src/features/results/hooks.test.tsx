import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PaginatedResult } from "@/types/shared";
import type { RecipeSummary } from "@/types/domain";
import { PAGINATION } from "@/constants";

const getRecipesByTag = vi.fn();

vi.mock("@/lib/api/services/recipeService", () => ({
  getRecipesByTag: (...args: unknown[]) => getRecipesByTag(...args),
  // Other named imports in hooks.ts — unused by these tests, present so the
  // module mock is complete.
  getRecipes: vi.fn(),
  searchRecipes: vi.fn(),
  searchRecipesByIngredient: vi.fn(),
  searchRecipesByCanonicalIngredient: vi.fn(),
}));

// Imported after the mock is registered.
import { useTagSearch } from "./hooks";

function makeWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

const recipe = (over: Partial<RecipeSummary> = {}): RecipeSummary => ({
  id: "r1",
  title: "עוגת שוקולד",
  slug: "chocolate-cake",
  image: null,
  categories: [],
  tags: [{ id: "t1", name: "מתכונים לשבת", slug: "shabbat", description: null, image: null }],
  difficulty: null,
  prepTime: null,
  totalTime: null,
  servings: null,
  ...over,
});

const page = (items: RecipeSummary[]): PaginatedResult<RecipeSummary> => ({
  items,
  pagination: { page: 1, pageSize: 100, pageCount: 1, total: items.length },
});

describe("useTagSearch", () => {
  beforeEach(() => {
    getRecipesByTag.mockReset();
  });

  it("requests a single page at the max page size and unwraps to the items array", async () => {
    getRecipesByTag.mockResolvedValue(page([recipe()]));

    const { result } = renderHook(() => useTagSearch("shabbat"), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getRecipesByTag).toHaveBeenCalledWith("shabbat", { pageSize: PAGINATION.MAX_PAGE_SIZE });
    expect(result.current.data).toEqual([recipe()]);
  });

  it("returns an empty array for a tag with no published recipes", async () => {
    getRecipesByTag.mockResolvedValue(page([]));

    const { result } = renderHook(() => useTagSearch("obscure"), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("is disabled (no request) for an empty slug", () => {
    const { result } = renderHook(() => useTagSearch("  "), { wrapper: makeWrapper() });

    expect(getRecipesByTag).not.toHaveBeenCalled();
    expect(result.current.fetchStatus).toBe("idle");
  });
});
