// AppBar height — keep in sync with the Header component.
export const HEADER_HEIGHT = 64;

export const SIDEBAR_WIDTH = 300;

export const RecipeDetailLayoutStyle = {
  // Two-column grid on desktop; single column on mobile.
  // With dir="rtl", column 1 renders on the visual RIGHT — that is where the
  // sidebar lives. Column 2 (1fr) is on the visual LEFT for main content.
  grid: {
    display: "grid",
    gridTemplateColumns: {
      xs: "1fr",
      md: `${SIDEBAR_WIDTH}px 1fr`,
    },
    // Default align-items is "stretch" — the sidebar grid cell grows to the
    // full row height (= main content height). This is required for
    // position:sticky inside the sidebar to have room to travel.
  },
  sidebarColumn: {
    // borderRight in source → border-left in RTL CSS (stylis-plugin-rtl flip).
    // Result: a border on the LEFT face of the sidebar (the face that touches
    // the main content column). Only visible on desktop where the grid is active.
    borderRight: { md: 1 },
    borderColor: "divider",
  },
  mainColumn: {
    minWidth: 0, // prevent content from blowing out the grid cell
  },
} as const;
