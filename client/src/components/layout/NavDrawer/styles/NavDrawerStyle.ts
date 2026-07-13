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
  // Branded header: logo (start/right in RTL) + close button (end/left in RTL).
  // flexShrink:0 keeps it out of the scrollable navContent area.
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 64,
    px: 1.5,
    flexShrink: 0,
  },
  logoLink: {
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
    borderRadius: 1,
    "&:focus-visible": {
      outline: "2px solid",
      outlineColor: "primary.main",
      outlineOffset: "4px",
    },
  },
  logo: {
    display: "block",
    height: 36,
    width: "auto",
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
