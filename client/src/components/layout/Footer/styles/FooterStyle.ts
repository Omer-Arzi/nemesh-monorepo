export const FooterStyle = {
  root: {
    position: "relative" as const,
    overflow: "hidden" as const,
    bgcolor: "background.paper",
    borderTop: 1,
    borderColor: "divider",
    pt: { xs: 2, md: 3 },
    pb: { xs: 4, md: 5 },
  },
  sections: {
    mb: 3,
  },
  sectionTitle: {
    fontWeight: 700,
    mb: 1.5,
    color: "text.primary",
  },
  linkList: {
    listStyle: "none",
    p: 0,
    m: 0,
  },
  linkItem: {
    mb: 0.75,
  },
  link: {
    fontSize: "0.875rem",
    color: "text.secondary",
    textDecoration: "none",
    "&:hover": {
      color: "primary.main",
    },
  },
  bottom: {
    textAlign: "center",
    mt: 2,
  },
  bottomWithDivider: {
    borderTop: 1,
    borderColor: "divider",
    pt: 2,
    mt: 3,
    textAlign: "center",
  },
  copyright: {
    color: "text.secondary",
  },
} as const;
