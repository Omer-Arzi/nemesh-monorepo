import { HEADER_HEIGHT } from "../../RecipeDetailLayout/styles/RecipeDetailLayoutStyle";

export const StickyIngredientsSidebarStyle = {
  // Outer wrapper — fills the grid cell height but does not scroll.
  outer: {
    height: "100%",
  },
  // Inner container is the sticky element.
  // On desktop: sticks below the AppBar and scrolls internally when the
  // ingredient list is taller than the visible viewport area.
  // On mobile: behaves as a normal block element (no sticky, no max-height).
  stickyInner: {
    position: { xs: "static", md: "sticky" } as const,
    top: { md: HEADER_HEIGHT },
    maxHeight: { md: `calc(100vh - ${HEADER_HEIGHT}px)` },
    overflowY: { md: "auto" } as const,
    p: { xs: 2, md: 3 },
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    pb: 2,
    mb: 2,
    borderBottom: 1,
    borderColor: "divider",
  },
  headerTitle: {
    fontWeight: 600,
  },
} as const;
