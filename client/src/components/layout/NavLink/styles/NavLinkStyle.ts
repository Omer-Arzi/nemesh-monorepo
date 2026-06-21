export const NavLinkStyle = {
  root: (isActive: boolean) => ({
    fontWeight: isActive ? 700 : 400,
    borderBottom: 2,
    borderColor: isActive ? "primary.main" : "transparent",
    borderRadius: 0,
    px: 1.5,
    py: 0.75,
    "&:hover": {
      borderColor: "primary.light",
      backgroundColor: "transparent",
    },
  }),
} as const;
