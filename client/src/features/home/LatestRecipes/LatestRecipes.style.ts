export const LatestRecipesStyle = {
  root: {
    py: { xs: 5, sm: 6 },
    bgcolor: "background.paper",
    borderTop: "1px solid",
    borderBottom: "1px solid",
    borderColor: "divider",
  },

  showAllLink: {
    typography: "body2",
    fontWeight: 600,
    color: "primary.main",
    textDecoration: "none",
    "&:hover": {
      textDecoration: "underline",
    },
  },
} as const;
