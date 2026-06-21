export const HeaderStyle = {
  appBar: {
    borderBottom: 1,
    borderColor: "divider",
  },
  toolbar: {
    gap: 2,
  },
  wordmark: {
    textDecoration: "none",
    color: "inherit",
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  },
  wordmarkText: {
    fontWeight: 700,
  },
  desktopNav: {
    display: { xs: "none", md: "flex" },
    alignItems: "center",
    gap: 0.5,
    flexGrow: 1,
  },
  spacer: {
    flexGrow: 1,
    display: { md: "none" },
  },
  hamburger: {
    display: { md: "none" },
    ml: "auto",
  },
} as const;
