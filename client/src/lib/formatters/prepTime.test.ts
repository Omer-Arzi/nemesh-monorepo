import { describe, it, expect } from "vitest";
import { formatPrepTime } from "./prepTime";

describe("formatPrepTime — abbreviated option", () => {
  it("defaults to the full word when the option is omitted", () => {
    expect(formatPrepTime(45)).toBe("45 דקות");
  });

  it("abbreviates the plain-minutes case", () => {
    expect(formatPrepTime(45, { abbreviated: true })).toBe("45 דק׳");
  });

  it("abbreviates the verbose hour-plus-remainder fallback too", () => {
    // 65 minutes = 1 hour + 5 minutes, no quarter-hour shortcut applies.
    expect(formatPrepTime(65)).toBe("שעה ו-5 דקות");
    expect(formatPrepTime(65, { abbreviated: true })).toBe("שעה ו-5 דק׳");
  });

  it("leaves hour-only phrasing untouched — no 'דקות' involved", () => {
    expect(formatPrepTime(60, { abbreviated: true })).toBe("שעה");
    expect(formatPrepTime(90, { abbreviated: true })).toBe("שעה וחצי");
  });
});
