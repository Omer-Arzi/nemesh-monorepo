export const NemeshImageStyle = {
  wrapperFill: {
    position: "absolute" as const,
    inset: 0,
    // Transparent to pointer events so clicks reach the parent link/button.
    // onLoad / onError on the <img> inside are resource events, not pointer events — unaffected.
    pointerEvents: "none" as const,
  },
  wrapperDimensions: {
    position: "relative" as const,
    display: "block" as const,
    overflow: "hidden" as const,
  },
  skeleton: {
    position: "absolute" as const,
    inset: 0,
    height: "100%",
  },
  fallback: {
    position: "absolute" as const,
    inset: 0,
    bgcolor: "action.hover",
  },
} as const;
