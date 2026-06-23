const DRAWER_WIDTH = 280;

export const NavDrawerStyle = {
  paper: {
    width: DRAWER_WIDTH,
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  drawerHeader: {
    px: 2,
    py: 2,
  },
  // Mirrors NavigationRailStyle.nav padding so NavigationItem renders
  // with the same visual weight and spacing as in the desktop rail.
  navContent: {
    flex: 1,
    overflowY: "auto" as const,
    px: 1,
    pt: 1,
    pb: 3,
  },
} as const;
