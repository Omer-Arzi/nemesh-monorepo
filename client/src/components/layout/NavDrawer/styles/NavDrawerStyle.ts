const DRAWER_WIDTH = 260;

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
  listItemButton: {
    py: 1.5,
  },
  listItemText: (isActive: boolean) => ({
    fontWeight: isActive ? 700 : 400,
  }),
} as const;
