import type { SVGProps } from "react";

/**
 * "Search by ingredients" — a simple woven basket with a carrot and a
 * round vegetable peeking above the rim. Kept to two vegetables and plain
 * weave lines (no extra detail) so it stays legible at small sizes.
 */
export default function SearchByIngredientsIllustration(props: SVGProps<SVGSVGElement>) {
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
      <path d="M22,36 L26,18 L30,36 Z" />
      <path d="M26,18 L23,12" />
      <path d="M26,18 L26,10" />
      <path d="M26,18 L29,12" />
      <circle cx="38" cy="30" r="6" />
      <path d="M38,24 L38,20" />
      <path d="M16,36 C16,24 48,24 48,36" />
      <path d="M16,36 L48,36 L42,54 L22,54 Z" />
      <line x1="18.5" y1="42" x2="45.5" y2="42" />
      <line x1="20" y1="48" x2="44" y2="48" />
    </svg>
  );
}
