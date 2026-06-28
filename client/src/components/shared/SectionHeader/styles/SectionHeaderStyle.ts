export const SectionHeaderStyle = {
  root: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 2,
    mb: 3,
  },
  // Column flex so the accent bar can anchor to flex-start.
  // In RTL, flex-start = inline-start = right — the accent sits under the first character of the title.
  titleGroup: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    minWidth: 0,
  },
  title: {
    fontWeight: 700,
    letterSpacing: "-0.015em",
  },
  // Small warm accent bar — editorial marker that gives the title a visual anchor
  // without needing a heavy border or large decorative element.
  accent: {
    width: 28,
    height: 3,
    bgcolor: "primary.main",
    borderRadius: 1,
    mt: 0.75,
  },
  subtitle: {
    mt: 0.875,
  },
  actionSlot: {
    flexShrink: 0,
  },
} as const;
