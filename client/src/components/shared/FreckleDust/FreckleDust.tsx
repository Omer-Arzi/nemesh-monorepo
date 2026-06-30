"use client";

import { useTheme, alpha } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

export type FrecklePlacement =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "corners";

export type FreckleDensity = "low" | "medium";

type Dot = {
  cx: number; // % of container width
  cy: number; // % of container height
  r: number;  // fixed px
  opacity: number;
  palette: "primary" | "warning" | "secondary";
};

// Ordered nearest-corner-first. density="low" uses [0..LOW_COUNT-1], density="medium" uses all.
const CORNER_DOTS: Record<Exclude<FrecklePlacement, "corners">, Dot[]> = {
  "top-right": [
    { cx: 97, cy: 2,  r: 2.5, opacity: 0.26, palette: "primary"   },
    { cx: 93, cy: 7,  r: 4,   opacity: 0.22, palette: "warning"   },
    { cx: 99, cy: 12, r: 2.5, opacity: 0.24, palette: "primary"   },
    { cx: 89, cy: 4,  r: 2,   opacity: 0.18, palette: "secondary" },
    { cx: 95, cy: 16, r: 4.5, opacity: 0.20, palette: "primary"   },
    { cx: 87, cy: 10, r: 3,   opacity: 0.17, palette: "warning"   },
    { cx: 91, cy: 20, r: 2,   opacity: 0.18, palette: "primary"   },
    { cx: 83, cy: 6,  r: 2.5, opacity: 0.15, palette: "secondary" },
    { cx: 98, cy: 24, r: 3,   opacity: 0.14, palette: "primary"   },
    { cx: 79, cy: 13, r: 3.5, opacity: 0.13, palette: "warning"   },
    { cx: 85, cy: 23, r: 2,   opacity: 0.15, palette: "primary"   },
    { cx: 94, cy: 28, r: 2.5, opacity: 0.11, palette: "secondary" },
    { cx: 75, cy: 8,  r: 2,   opacity: 0.11, palette: "primary"   },
    { cx: 88, cy: 30, r: 3,   opacity: 0.10, palette: "warning"   },
    { cx: 70, cy: 16, r: 3,   opacity: 0.09, palette: "primary"   },
    { cx: 80, cy: 33, r: 2,   opacity: 0.08, palette: "secondary" },
  ],
  "top-left": [
    { cx: 3,  cy: 2,  r: 2.5, opacity: 0.26, palette: "primary"   },
    { cx: 7,  cy: 7,  r: 4,   opacity: 0.22, palette: "warning"   },
    { cx: 1,  cy: 12, r: 2.5, opacity: 0.24, palette: "primary"   },
    { cx: 11, cy: 4,  r: 2,   opacity: 0.18, palette: "secondary" },
    { cx: 5,  cy: 16, r: 4.5, opacity: 0.20, palette: "primary"   },
    { cx: 13, cy: 10, r: 3,   opacity: 0.17, palette: "warning"   },
    { cx: 9,  cy: 20, r: 2,   opacity: 0.18, palette: "primary"   },
    { cx: 17, cy: 6,  r: 2.5, opacity: 0.15, palette: "secondary" },
    { cx: 2,  cy: 24, r: 3,   opacity: 0.14, palette: "primary"   },
    { cx: 21, cy: 13, r: 3.5, opacity: 0.13, palette: "warning"   },
    { cx: 15, cy: 23, r: 2,   opacity: 0.15, palette: "primary"   },
    { cx: 6,  cy: 28, r: 2.5, opacity: 0.11, palette: "secondary" },
    { cx: 25, cy: 8,  r: 2,   opacity: 0.11, palette: "primary"   },
    { cx: 12, cy: 30, r: 3,   opacity: 0.10, palette: "warning"   },
    { cx: 30, cy: 16, r: 3,   opacity: 0.09, palette: "primary"   },
    { cx: 20, cy: 33, r: 2,   opacity: 0.08, palette: "secondary" },
  ],
  "bottom-right": [
    { cx: 97, cy: 98, r: 2.5, opacity: 0.26, palette: "primary"   },
    { cx: 93, cy: 93, r: 4,   opacity: 0.22, palette: "warning"   },
    { cx: 99, cy: 88, r: 2.5, opacity: 0.24, palette: "primary"   },
    { cx: 89, cy: 96, r: 2,   opacity: 0.18, palette: "secondary" },
    { cx: 95, cy: 84, r: 4.5, opacity: 0.20, palette: "primary"   },
    { cx: 87, cy: 90, r: 3,   opacity: 0.17, palette: "warning"   },
    { cx: 91, cy: 80, r: 2,   opacity: 0.18, palette: "primary"   },
    { cx: 83, cy: 94, r: 2.5, opacity: 0.15, palette: "secondary" },
    { cx: 98, cy: 76, r: 3,   opacity: 0.14, palette: "primary"   },
    { cx: 79, cy: 87, r: 3.5, opacity: 0.13, palette: "warning"   },
    { cx: 85, cy: 77, r: 2,   opacity: 0.15, palette: "primary"   },
    { cx: 94, cy: 72, r: 2.5, opacity: 0.11, palette: "secondary" },
    { cx: 75, cy: 92, r: 2,   opacity: 0.11, palette: "primary"   },
    { cx: 88, cy: 70, r: 3,   opacity: 0.10, palette: "warning"   },
    { cx: 70, cy: 84, r: 3,   opacity: 0.09, palette: "primary"   },
    { cx: 80, cy: 67, r: 2,   opacity: 0.08, palette: "secondary" },
  ],
  "bottom-left": [
    { cx: 3,  cy: 98, r: 2.5, opacity: 0.26, palette: "primary"   },
    { cx: 7,  cy: 93, r: 4,   opacity: 0.22, palette: "warning"   },
    { cx: 1,  cy: 88, r: 2.5, opacity: 0.24, palette: "primary"   },
    { cx: 11, cy: 96, r: 2,   opacity: 0.18, palette: "secondary" },
    { cx: 5,  cy: 84, r: 4.5, opacity: 0.20, palette: "primary"   },
    { cx: 13, cy: 90, r: 3,   opacity: 0.17, palette: "warning"   },
    { cx: 9,  cy: 80, r: 2,   opacity: 0.18, palette: "primary"   },
    { cx: 17, cy: 94, r: 2.5, opacity: 0.15, palette: "secondary" },
    { cx: 2,  cy: 76, r: 3,   opacity: 0.14, palette: "primary"   },
    { cx: 21, cy: 87, r: 3.5, opacity: 0.13, palette: "warning"   },
    { cx: 15, cy: 77, r: 2,   opacity: 0.15, palette: "primary"   },
    { cx: 6,  cy: 72, r: 2.5, opacity: 0.11, palette: "secondary" },
    { cx: 25, cy: 92, r: 2,   opacity: 0.11, palette: "primary"   },
    { cx: 12, cy: 70, r: 3,   opacity: 0.10, palette: "warning"   },
    { cx: 30, cy: 84, r: 3,   opacity: 0.09, palette: "primary"   },
    { cx: 20, cy: 67, r: 2,   opacity: 0.08, palette: "secondary" },
  ],
};

const ENABLED = false;
const LOW_COUNT = 40;

function getDots(placement: FrecklePlacement, _density: FreckleDensity, count: number): Dot[] {
  if (placement === "corners") {
    return (["top-right", "top-left", "bottom-right", "bottom-left"] as const)
      .flatMap((p) => CORNER_DOTS[p].slice(0, count));
  }
  return CORNER_DOTS[placement].slice(0, count);
}

type Props = {
  placement?: FrecklePlacement;
  density?: FreckleDensity;
};

export default function FreckleDust({ placement = "corners", density = "low" }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const count = density === "low" ? LOW_COUNT : Infinity;
  const effectiveCount = isMobile ? Math.ceil(count / 5) : count;
  const dots = getDots(placement, density, effectiveCount);
  if (!ENABLED) return null;

  const colorFor = (palette: Dot["palette"], opacity: number) => {
    const base =
      palette === "primary"
        ? theme.palette.primary.main
        : palette === "warning"
        ? theme.palette.warning.main
        : theme.palette.secondary.main;
    return alpha(base, opacity * 1.3);
  };

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {dots.map((dot, i) => (
        <circle
          key={i}
          cx={`${dot.cx}%`}
          cy={`${dot.cy}%`}
          r={dot.r}
          fill={colorFor(dot.palette, dot.opacity)}
        />
      ))}
    </svg>
  );
}
