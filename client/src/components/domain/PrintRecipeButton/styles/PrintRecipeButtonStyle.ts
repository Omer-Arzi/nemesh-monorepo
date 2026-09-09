export const PrintRecipeButtonStyle = {
  // Pill outline — quieter than the filled category badge (see design.md
  // §"On-screen printer control"). `minHeight: 44` lifts MUI size="small"
  // (~30px) to the touch-target minimum at every breakpoint.
  root: {
    borderRadius: 5,
    fontSize: "0.85rem",
    fontWeight: 600,
    minHeight: 44,
    px: 2,
    whiteSpace: "nowrap" as const,
    // Defense in depth — the button is rendered outside the print subtree and
    // must never appear in print output.
    "@media print": {
      display: "none",
    },
  },
} as const;
