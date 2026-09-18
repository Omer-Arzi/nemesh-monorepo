import type { PreparationSection } from "@/types/domain";

/**
 * Computes each preparation section's running step-count offset, so every
 * step across ALL sections in a recipe can be assigned a single global
 * 1-based number — independent of the per-section visible step badge
 * (`PreparationSteps.tsx`'s `stepNumberText`), which restarts at 1 in each
 * section. That visible numbering is a separate, purely visual concern and
 * is left untouched.
 *
 * offsets[i] = total step count across all sections before section i.
 * The global step number for step `stepIndexInSection` within section `i`
 * is `offsets[i] + stepIndexInSection + 1`.
 *
 * Shared by `PreparationStepsSection.tsx` (assigns each step's DOM anchor
 * id) and `structuredData.ts` (builds the matching `HowToStep.url`) so the
 * numbering scheme is computed once, not duplicated in two places.
 */
export function computeSectionStepOffsets(
  sections: Pick<PreparationSection, "steps">[],
): number[] {
  const offsets: number[] = [];
  let running = 0;
  for (const section of sections) {
    offsets.push(running);
    running += section.steps.length;
  }
  return offsets;
}

/**
 * Stable anchor id for a preparation step, shared between the rendered DOM
 * (`PreparationSteps.tsx`, `id="step-N"`) and each `HowToStep.url` in
 * Recipe JSON-LD (`structuredData.ts`, `{canonicalUrl}#step-N`). Keep both
 * call sites using this helper so the scheme never drifts out of sync.
 */
export function stepAnchorId(globalStepNumber: number): string {
  return `step-${globalStepNumber}`;
}
