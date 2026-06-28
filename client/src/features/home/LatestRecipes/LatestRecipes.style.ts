export const LatestRecipesStyle = {
  root: {
    // Graduated vertical rhythm: compact on mobile (avoid hollow sections),
    // generous on desktop (wide screens benefit from more breathing room).
    py: { xs: 4, sm: 5, md: 6 },
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
      color: "primary.dark",
      textDecoration: "underline",
    },
  },
} as const;
