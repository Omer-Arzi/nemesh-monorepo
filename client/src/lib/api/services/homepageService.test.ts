import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiClient } from "../client";
import { getHomepage } from "./homepageService";

vi.mock("../client", () => ({
  apiClient: { get: vi.fn() },
}));

type TagRow = {
  name: string | null;
  slug: string | null;
  count: number | null;
};

// Minimal Strapi v5 single-type payload — only the fields the mapper reads.
function makeHomepageResponse(rows: Array<TagRow | null>) {
  return {
    data: {
      id: 1,
      documentId: "homepage-1",
      heroTitle: null,
      heroSubtitle: null,
      heroBackgroundImage: null,
      latestRecipesTitle: null,
      featuredCategoriesTitle: null,
      about: null,
      featureSection: null,
      recommendedSearchTags: rows.map((row, i) => ({
        id: i + 1,
        tag:
          row === null
            ? null
            : {
                name: row.name,
                slug: row.slug,
                recipes: row.count === null ? null : { count: row.count },
              },
      })),
    },
  };
}

describe("getHomepage — recommendedTags mapping", () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
  });

  it("keeps editor row order and drops nothing when every tag qualifies", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce(
      makeHomepageResponse([
        { name: "ב", slug: "b", count: 3 },
        { name: "א", slug: "a", count: 1 },
        { name: "ג", slug: "c", count: 9 },
      ])
    );

    const page = await getHomepage();

    expect(page?.recommendedTags).toEqual([
      { name: "ב", slug: "b" },
      { name: "א", slug: "a" },
      { name: "ג", slug: "c" },
    ]);
  });

  it("drops a curated tag with zero published recipes and keeps the rest in order (D1)", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce(
      makeHomepageResponse([
        { name: "ראשון", slug: "first", count: 2 },
        { name: "ריק", slug: "empty", count: 0 },
        { name: "שלישי", slug: "third", count: 5 },
      ])
    );

    const page = await getHomepage();

    expect(page?.recommendedTags).toEqual([
      { name: "ראשון", slug: "first" },
      { name: "שלישי", slug: "third" },
    ]);
  });

  it("drops rows with a missing tag relation or missing name/slug", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce(
      makeHomepageResponse([
        null,
        { name: null, slug: "no-name", count: 4 },
        { name: "בלי-סלאג", slug: null, count: 4 },
        { name: "  ", slug: "blank", count: 4 },
        { name: "תקין", slug: "ok", count: 4 },
      ])
    );

    const page = await getHomepage();

    expect(page?.recommendedTags).toEqual([{ name: "תקין", slug: "ok" }]);
  });

  it("treats a missing recipes count as zero (dropped)", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce(
      makeHomepageResponse([
        { name: "ללא-ספירה", slug: "no-count", count: null },
        { name: "עם-ספירה", slug: "has-count", count: 1 },
      ])
    );

    const page = await getHomepage();

    expect(page?.recommendedTags).toEqual([{ name: "עם-ספירה", slug: "has-count" }]);
  });

  it("caps the result at 5 even if more qualifying rows arrive", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce(
      makeHomepageResponse(
        Array.from({ length: 7 }, (_, i) => ({ name: `t${i}`, slug: `t${i}`, count: 1 }))
      )
    );

    const page = await getHomepage();

    expect(page?.recommendedTags).toHaveLength(5);
    expect(page?.recommendedTags.map((t) => t.slug)).toEqual(["t0", "t1", "t2", "t3", "t4"]);
  });

  it("returns an empty array when the field is absent (existing pre-migration payload)", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        id: 1,
        documentId: "homepage-1",
        heroTitle: null,
        heroSubtitle: null,
        heroBackgroundImage: null,
        latestRecipesTitle: null,
        featuredCategoriesTitle: null,
        about: null,
        featureSection: null,
      },
    });

    const page = await getHomepage();
    expect(page?.recommendedTags).toEqual([]);
  });
});
