export const FeaturedCategoryCardStyle = {
  root: {
    position: "relative" as const,
    display: "block",
    width: 200,
    height: 260,
    borderRadius: "14px",
    overflow: "hidden",
    flexShrink: 0,
    textDecoration: "none",
    scrollSnapAlign: "start",
    boxShadow:
      "0 2px 12px rgba(26, 18, 8, 0.10), 0 1px 4px rgba(26, 18, 8, 0.06)",
    transition: "transform 250ms ease, box-shadow 250ms ease",
    "&:hover": {
      transform: "translateY(-4px) scale(1.02)",
      boxShadow:
        "0 8px 28px rgba(26, 18, 8, 0.18), 0 2px 8px rgba(26, 18, 8, 0.10)",
    },
  },

  image: {
    position: "absolute" as const,
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
  },

  fallback: {
    position: "absolute" as const,
    inset: 0,
    background:
      "linear-gradient(135deg, #E8A96B 0%, #C17B3C 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "3rem",
    color: "rgba(255,255,255,0.55)",
  },

  overlay: {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    right: 0,
    background:
      "linear-gradient(to top, rgba(0,0,0,0.68), rgba(0,0,0,0.22), transparent)",
    px: 1.5,
    pt: 5,
    pb: 1.5,
  },

  label: {
    color: "#FFFFFF",
    fontWeight: 700,
    fontSize: "0.9rem",
    lineHeight: 1.3,
    textShadow: "0 1px 4px rgba(0,0,0,0.5)",
  },
} as const;
