import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { middleware, config } from "./middleware";

const run = (path: string) => middleware(new NextRequest(`http://localhost:3000${path}`));

describe("middleware — noindex for /results?tag=", () => {
  it("sets X-Robots-Tag: noindex when a tag param is present", () => {
    expect(run("/results?tag=shabbat").headers.get("X-Robots-Tag")).toBe("noindex");
  });

  it("leaves the other /results modes untouched", () => {
    expect(run("/results?q=%D7%97%D7%9C%D7%94").headers.get("X-Robots-Tag")).toBeNull();
    expect(run("/results?ingredient=%D7%91%D7%A6%D7%9C").headers.get("X-Robots-Tag")).toBeNull();
    expect(run("/results").headers.get("X-Robots-Tag")).toBeNull();
  });

  it("is scoped to the /results path only", () => {
    expect(config.matcher).toBe("/results");
  });
});
