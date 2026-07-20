import type { SVGProps } from "react";

/**
 * "Ingredients always available" — a recipe/ingredient card with a small
 * herb sprig accent, not a clipboard or to-do list. The sprig is what
 * reads as culinary rather than office-related; the card itself is kept
 * plain (no clip, no checkboxes) so it doesn't default to "task app".
 */
export default function IngredientsAvailableIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      width="100%"
      height="100%"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M32,14 C28,13 26,9 29,6 C32,9 33,12 32,14 Z" />
      <path d="M32,14 C36,13 38,9 35,6 C32,9 31,12 32,14 Z" />
      <rect x="15" y="14" width="34" height="40" rx="6" />
      <line x1="21" y1="23" x2="39" y2="23" />
      <line x1="21" y1="31" x2="43" y2="31" />
      <line x1="21" y1="39" x2="33" y2="39" />
      <line x1="21" y1="47" x2="37" y2="47" />
    </svg>
  );
}
