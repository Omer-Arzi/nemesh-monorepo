export const HeaderStyle = {
  appBar: {
    borderBottom: 1,
    borderColor: "divider",
  },
  toolbar: {
    gap: 2,
    // On mobile (xs), row-reverse in RTL cancels the RTL row direction, making
    // items flow LTR: wordmark goes LEFT, spacer fills centre, hamburger goes RIGHT.
    // On desktop (md+), normal RTL row is restored: wordmark RIGHT, nav centre.
    flexDirection: { xs: "row-reverse", md: "row" } as const,
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
    // ml:"auto" removed — it was flipped to mr:"auto" by stylis-plugin-rtl and
    // fought the spacer in the row-reverse mobile layout. The spacer handles positioning.
  },
} as const;
