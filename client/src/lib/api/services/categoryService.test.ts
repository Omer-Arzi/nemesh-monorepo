import { describe, it, expect, vi } from "vitest";
import { apiClient } from "../client";
import { getCategoryBySlug } from "./categoryService";

vi.mock("../client", () => ({
  apiClient: { get: vi.fn() },
}));

function makeRawCategory(overrides: { slug: string }) {
  return {
    data: [
      {
        id: 1,
        documentId: "cat-1",
        name: "עוף",
        menuName: null,
        slug: overrides.slug,
        description: null,
        image: null,
      },
    ],
    meta: {},
  };
}

describe("getCategoryBySlug", () => {
  it("filters case-insensitively ($eqi), so a differently-cased slug still resolves", async () => {
    vi.mocked(apiClient.get).mockResolvedValue(makeRawCategory({ slug: "chicken" }));

    await getCategoryBySlug("Chicken");

    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining("filters[slug][$eqi]=Chicken"),
    );
    expect(apiClient.get).not.toHaveBeenCalledWith(expect.stringContaining("$eq]="));
  });

  it("returns the category with its real, stored slug regardless of the requested casing", async () => {
    vi.mocked(apiClient.get).mockResolvedValue(makeRawCategory({ slug: "chicken" }));

    const category = await getCategoryBySlug("CHICKEN");

    expect(category?.slug).toBe("chicken");
  });

  it("returns null when nothing matches", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [], meta: {} });

    const category = await getCategoryBySlug("not-a-real-category");

    expect(category).toBeNull();
  });

  it("propagates (does not swallow) a transport failure — a real outage must never look like a plain 'not found'", async () => {
    vi.mocked(apiClient.get).mockRejectedValue({ status: 503, message: "Service Unavailable" });

    await expect(getCategoryBySlug("beef")).rejects.toMatchObject({ status: 503 });
  });
});
