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
  // Close button only (end/left in RTL) — no logo, the navbar behind the
  // drawer already shows it. flexShrink:0 keeps it out of the scrollable
  // navContent area. justifyContent:flex-end keeps the button in the same
  // physical spot it held back when the logo sat opposite it.
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    minHeight: 64,
    px: 1.5,
    flexShrink: 0,
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
