export const FeatureSectionStyle = {
  section: {
    py: { xs: 3, sm: 3.5, md: 4 },
  },

  title: {
    mb: { xs: 2.5, md: 3 },
    fontWeight: 700,
    color: "text.primary",
    textAlign: "center",
  },

  cards: {
    display: "flex",
    flexDirection: { xs: "column", md: "row" },
    gap: { xs: 2, md: 3 },
  },

  card: {
    flex: "1 1 0%",
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: 1,
    p: { xs: 2, md: 2.5 },
    borderRadius: "16px",
    border: "1px solid",
    borderColor: "divider",
    bgcolor: "background.paper",
  },

  iconWrapper: {
    position: "relative",
    width: 56,
    height: 56,
  },

  cardTitle: {
    fontWeight: 700,
    color: "text.primary",
  },

  cardDescription: {
    color: "text.secondary",
  },

  readMoreWrapper: {
    display: "flex",
    justifyContent: "center",
    mt: { xs: 2.5, md: 3 },
  },

  readMoreLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: 1,
    color: "text.secondary",
    fontWeight: 600,
    transition: "color 0.15s ease",
    "&:hover, &:focus-visible": {
      color: "text.primary",
    },
    "&:hover .feature-section-arrow, &:focus-visible .feature-section-arrow": {
      transform: "translateX(5px)",
    },
  },

  readMoreArrow: {
    display: "inline-block",
    transition: "transform 0.2s ease",
  },
} as const;
