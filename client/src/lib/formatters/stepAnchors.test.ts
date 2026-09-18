import { describe, it, expect } from "vitest";
import { computeSectionStepOffsets, stepAnchorId } from "./stepAnchors";

describe("computeSectionStepOffsets", () => {
  it("returns [0] for a single section", () => {
    expect(computeSectionStepOffsets([{ steps: [{}, {}, {}] as never }])).toEqual([0]);
  });

  it("accumulates a running offset across multiple sections", () => {
    const sections = [
      { steps: new Array(2).fill({}) as never },
      { steps: new Array(3).fill({}) as never },
      { steps: new Array(1).fill({}) as never },
    ];
    expect(computeSectionStepOffsets(sections)).toEqual([0, 2, 5]);
  });

  it("treats an empty section as contributing zero to the running offset", () => {
    const sections = [
      { steps: new Array(2).fill({}) as never },
      { steps: [] as never },
      { steps: new Array(1).fill({}) as never },
    ];
    expect(computeSectionStepOffsets(sections)).toEqual([0, 2, 2]);
  });

  it("returns an empty array for no sections", () => {
    expect(computeSectionStepOffsets([])).toEqual([]);
  });
});

describe("stepAnchorId", () => {
  it("formats a global step number as step-N", () => {
    expect(stepAnchorId(1)).toBe("step-1");
    expect(stepAnchorId(7)).toBe("step-7");
  });
});
