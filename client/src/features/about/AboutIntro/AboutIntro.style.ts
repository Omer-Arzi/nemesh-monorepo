export const AboutIntroStyle = {
  root: {
    display: "flex",
    flexDirection: { xs: "column", md: "row" } as const,
    gap: { xs: 5, md: 7 },
    alignItems: { xs: "stretch", md: "flex-start" } as const,
  },

  // DOM order is the reading order: text first, photos second. In RTL this
  // places text on the physical right and photos on the physical left
  // without any manual position overrides.
  textColumn: {
    flex: { md: "1 1 58%" },
    minWidth: 0,
  },

  railColumn: {
    flex: { md: "1 1 38%" },
    minWidth: 0,
  },

  eyebrow: {
    display: "block" as const,
    fontWeight: 700,
    fontSize: "0.8125rem",
    letterSpacing: "0.02em",
    color: "primary.main",
  },

  // Same accent-bar motif used under SectionHeader titles elsewhere on the site.
  accent: {
    width: 28,
    height: 3,
    bgcolor: "warning.main",
    borderRadius: 1,
    mt: 1.25,
    mb: 2.5,
  },

  heading: {
    fontWeight: 700,
    color: "text.primary",
    mb: 3,
  },
} as const;
