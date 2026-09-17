import { describe, it, expect, vi } from "vitest";
import { apiClient } from "../client";
import { getCurrentChallengeMonth, getShirChallengeCarouselMonths } from "./shirChallengeMonthService";

vi.mock("../client", () => ({
  apiClient: { get: vi.fn() },
}));

// Minimal Strapi v5-shaped month fixture — only the fields mapMonth actually reads.
function makeRawMonth(overrides: {
  id: number;
  documentId: string;
  monthKey: string;
  recipe?: {
    title: string;
    slug: string;
    prepTime: number | null;
    publishedAt: string | null;
    image?: unknown;
  } | null;
}) {
  return {
    id: overrides.id,
    documentId: overrides.documentId,
    monthKey: overrides.monthKey,
    monthStart: `${overrides.monthKey}-01`,
    monthlyIngredientName: null,
    monthlyChallengeStatus: "pending" as const,
    monthlyChallengeNote: null,
    myProgressStatus: null,
    recipe: "recipe" in overrides ? overrides.recipe : undefined,
  };
}

function mockMonths(months: ReturnType<typeof makeRawMonth>[]) {
  vi.mocked(apiClient.get).mockResolvedValueOnce({
    data: months,
    meta: { pagination: { page: 1, pageSize: 100, pageCount: 1, total: months.length } },
  });
}

describe("getShirChallengeCarouselMonths — D3 inclusion rule", () => {
  it("includes a month with a matched, published recipe even when not current", async () => {
    mockMonths([
      makeRawMonth({
        id: 1,
        documentId: "month-1",
        monthKey: "2026-08",
        recipe: { title: "עוגת שוקולד", slug: "chocolate-cake", prepTime: 30, publishedAt: "2026-08-01T00:00:00.000Z" },
      }),
    ]);

    const months = await getShirChallengeCarouselMonths("2026-09");
    expect(months).toHaveLength(1);
    expect(months[0].recipe).toEqual({
      title: "עוגת שוקולד",
      slug: "chocolate-cake",
      prepTime: 30,
      image: null,
    });
  });

  it("includes the current month as a placeholder when unmatched", async () => {
    mockMonths([makeRawMonth({ id: 1, documentId: "month-1", monthKey: "2026-09", recipe: null })]);

    const months = await getShirChallengeCarouselMonths("2026-09");
    expect(months).toHaveLength(1);
    expect(months[0].recipe).toBeNull();
  });

  it("excludes a non-current, unmatched month (back-support gap)", async () => {
    mockMonths([makeRawMonth({ id: 1, documentId: "month-1", monthKey: "2026-07", recipe: null })]);

    const months = await getShirChallengeCarouselMonths("2026-09");
    expect(months).toHaveLength(0);
  });

  it("treats an unpublished (draft) linked recipe as unmatched", async () => {
    mockMonths([
      makeRawMonth({
        id: 1,
        documentId: "month-1",
        monthKey: "2026-07",
        recipe: { title: "טיוטה", slug: "draft-recipe", prepTime: 10, publishedAt: null },
      }),
    ]);

    // Non-current + unpublished recipe → excluded entirely.
    const months = await getShirChallengeCarouselMonths("2026-09");
    expect(months).toHaveLength(0);
  });

  it("shows a current month with an unpublished linked recipe as the placeholder state", async () => {
    mockMonths([
      makeRawMonth({
        id: 1,
        documentId: "month-1",
        monthKey: "2026-09",
        recipe: { title: "טיוטה", slug: "draft-recipe", prepTime: 10, publishedAt: null },
      }),
    ]);

    const months = await getShirChallengeCarouselMonths("2026-09");
    expect(months).toHaveLength(1);
    expect(months[0].recipe).toBeNull();
  });

  it("preserves server-provided newest-first order and mixed match states", async () => {
    mockMonths([
      makeRawMonth({
        id: 3,
        documentId: "month-3",
        monthKey: "2026-09",
        recipe: null,
      }),
      makeRawMonth({
        id: 2,
        documentId: "month-2",
        monthKey: "2026-08",
        recipe: { title: "פשטידה", slug: "quiche", prepTime: 20, publishedAt: "2026-08-01T00:00:00.000Z" },
      }),
      makeRawMonth({ id: 1, documentId: "month-1", monthKey: "2026-07", recipe: null }),
    ]);

    const months = await getShirChallengeCarouselMonths("2026-09");
    expect(months.map((m) => m.monthKey)).toEqual(["2026-09", "2026-08"]);
  });

  it("old months with no recipe key at all (pre-migration shape) map to null and follow the same inclusion rule", async () => {
    mockMonths([makeRawMonth({ id: 1, documentId: "month-1", monthKey: "2026-09" })]);

    const months = await getShirChallengeCarouselMonths("2026-09");
    expect(months).toHaveLength(1);
    expect(months[0].recipe).toBeNull();
  });

  it("requests a monthKey:desc, monthStart:desc tie-break sort (monthKey is no longer unique)", async () => {
    mockMonths([]);

    await getShirChallengeCarouselMonths("2026-09");

    const requestedUrl = vi.mocked(apiClient.get).mock.calls.at(-1)?.[0] as string;
    expect(requestedUrl).toContain("sort[0]=monthKey:desc");
    expect(requestedUrl).toContain("sort[1]=monthStart:desc");
  });
});

describe("getCurrentChallengeMonth — determinism when a month has 2+ records", () => {
  it("requests an explicit monthStart:asc tie-break sort", async () => {
    mockMonths([]);

    await getCurrentChallengeMonth("2026-09");

    const requestedUrl = vi.mocked(apiClient.get).mock.calls.at(-1)?.[0] as string;
    expect(requestedUrl).toContain("filters[monthKey][$eq]=2026-09");
    expect(requestedUrl).toContain("sort[0]=monthStart:asc");
  });

  it("picks the chronologically-first instance among two records sharing a monthKey", async () => {
    mockMonths([
      makeRawMonth({ id: 2, documentId: "month-2b", monthKey: "2026-09" }),
      makeRawMonth({ id: 1, documentId: "month-2a", monthKey: "2026-09" }),
    ]);

    const result = await getCurrentChallengeMonth("2026-09");

    // pageSize=1 means the service only ever reads data[0]; the sort
    // (asserted above) is what guarantees the server puts the
    // chronologically-first record there — this just documents that
    // data[0] (not some other selection) is what's returned.
    expect(result?.id).toBe("month-2b");
  });
});
