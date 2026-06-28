export const NemeshImageStyle = {
  wrapperFill: {
    position: "absolute" as const,
    inset: 0,
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
