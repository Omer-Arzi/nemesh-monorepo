import type { SVGProps } from "react";

/**
 * "Cooking mode" — a wide, flat-bottomed pot with short stub handles,
 * three flames (outer silhouette + one inner tongue line each, center
 * flame taller — a common "stovetop" cue) sharing a baseline beneath the
 * pot, and a small checkmark badge as a secondary accent (top-right,
 * clear of the pot outline, not the focal point). Deliberately no chef
 * hat / tray / timer — the pot + flames pair is what reads as "active
 * cooking workflow" rather than just "food".
 *
 * Each flame is a <g scale(...)> of the same path so all three stay
 * visually identical in shape — vector-effect="non-scaling-stroke" keeps
 * their stroke weight matching the rest of the icon despite the scale.
 */
export default function CookingModeIllustration(props: SVGProps<SVGSVGElement>) {
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
      <line x1="14" y1="20" x2="50" y2="20" />
      <path d="M14,20 L14,28 C14,33 18,36 24,36 L40,36 C46,36 50,33 50,28 L50,20" />
      <line x1="14" y1="23" x2="9" y2="23" />
      <line x1="50" y1="23" x2="55" y2="23" />

      <g transform="translate(-3.2,19.2) scale(0.6)">
        <path
          d="M32,38 C39,45 39,53 34,57 C33,58 31,58 30,57 C27,54 26,49 28,45 C29,43 30,41 32,38 Z"
          vectorEffect="non-scaling-stroke"
        />
        <path d="M31,50 C29.5,52 29.5,54 31,55.5" vectorEffect="non-scaling-stroke" />
      </g>
      <g transform="translate(6.4,7.6) scale(0.8)">
        <path
          d="M32,38 C39,45 39,53 34,57 C33,58 31,58 30,57 C27,54 26,49 28,45 C29,43 30,41 32,38 Z"
          vectorEffect="non-scaling-stroke"
        />
        <path d="M31,50 C29.5,52 29.5,54 31,55.5" vectorEffect="non-scaling-stroke" />
      </g>
      <g transform="translate(28.8,19.2) scale(0.6)">
        <path
          d="M32,38 C39,45 39,53 34,57 C33,58 31,58 30,57 C27,54 26,49 28,45 C29,43 30,41 32,38 Z"
          vectorEffect="non-scaling-stroke"
        />
        <path d="M31,50 C29.5,52 29.5,54 31,55.5" vectorEffect="non-scaling-stroke" />
      </g>

      <circle cx="49" cy="11" r="5" />
      <path d="M46.7,11.2 L48.3,12.8 L51.5,9" />
    </svg>
  );
}
