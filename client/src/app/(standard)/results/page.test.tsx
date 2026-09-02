import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithTheme as render } from "@/test/renderWithTheme";
import type { RecipeSummary } from "@/types/domain";
import { ResultsPageText } from "./consts";
import ResultsPage from "./page";

const replace = vi.fn();
let params = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn(), prefetch: vi.fn() }),
  useSearchParams: () => params,
}));

vi.mock("@/lib/analytics", () => ({
  analytics: { trackPageView: vi.fn() },
}));

type QueryLike = { data: RecipeSummary[]; isLoading: boolean; isError: boolean };
let tagState: QueryLike = { data: [], isLoading: true, isError: false };

const inactive = { data: [], isLoading: false, isError: false };

vi.mock("@/features/results/hooks", () => ({
  useTagSearch: () => tagState,
  useSearch: () => inactive,
  useIngredientSearch: () => inactive,
  useCanonicalIngredientSearch: () => inactive,
  useInfiniteRecipes: () => ({
    ...inactive,
    data: undefined,
    isLoading: true,
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
    refetch: vi.fn(),
  }),
}));

const recipe: RecipeSummary = {
  id: "r1",
  title: "חלה מתוקה",
  slug: "sweet-challah",
  image: null,
  categories: [],
  tags: [{ id: "t1", name: "מתכונים לשבת", slug: "shabbat", description: null, image: null }],
  difficulty: null,
  prepTime: null,
  totalTime: null,
  servings: null,
};

describe("/results — tag-filter mode", () => {
  beforeEach(() => {
    replace.mockReset();
    params = new URLSearchParams("tag=shabbat");
    tagState = { data: [], isLoading: true, isError: false };
  });

  it("resolving: shows a neutral skeleton, no heading, no redirect", () => {
    tagState = { data: [], isLoading: true, isError: false };

    const { container } = render(<ResultsPage />);

    expect(container.querySelector(".MuiSkeleton-root")).not.toBeNull();
    expect(screen.queryByText(/מתכונים בנושא/)).not.toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("valid tag: renders the resolved-name heading and the recipe grid", () => {
    tagState = { data: [recipe], isLoading: false, isError: false };

    render(<ResultsPage />);

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent('מתכונים בנושא "מתכונים לשבת"');
    expect(screen.getByText("חלה מתוקה")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("invalid tag (empty result): silently redirects home, renders no heading or empty state", async () => {
    tagState = { data: [], isLoading: false, isError: false };

    render(<ResultsPage />);

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
    expect(screen.queryByText(/מתכונים בנושא/)).not.toBeInTheDocument();
  });

  it("transient fetch error: shows ErrorState with no retry button, no heading, no redirect", () => {
    tagState = { data: [], isLoading: false, isError: true };

    render(<ResultsPage />);

    expect(screen.getByRole("alert")).toHaveTextContent(ResultsPageText.browseError);
    expect(screen.queryByRole("button", { name: "נסה שוב" })).not.toBeInTheDocument();
    expect(screen.queryByText(/מתכונים בנושא/)).not.toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
