export const AppShellStyle = {
  root: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
  },
  // RTL flex row: NavigationRail (first child) appears on physical right,
  // content wrapper (second child) fills the remaining space on the left.
  body: {
    display: "flex",
    flex: 1,
  },
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  main: {
    flex: 1,
  },
} as const;
