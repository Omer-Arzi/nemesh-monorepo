export const FooterStyle = {
  root: {
    position: "relative" as const,
    overflow: "hidden" as const,
    bgcolor: "background.paper",
    borderTop: 1,
    borderColor: "divider",
    py: { xs: 4, md: 6 },
  },
  text: {
    textAlign: "center",
  },
} as const;
