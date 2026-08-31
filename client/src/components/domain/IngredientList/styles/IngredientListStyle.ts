export const IngredientListStyle = {
  listItem: {
    py: 0.75,
    borderBottom: 1,
    borderColor: "divider",
    flexDirection: "column",
    alignItems: "flex-start",
    "&:last-child": { borderBottom: 0 },
  },
  listItemClickable: {
    flexDirection: "row" as const,
    alignItems: "flex-start",
    gap: 1,
    cursor: "pointer",
    userSelect: "none" as const,
    touchAction: "manipulation" as const,
    transition: "background-color 0.12s ease",
    borderRadius: 1,
    px: 0.5,
    "&:active": { bgcolor: "action.hover" },
  },
  listItemChecked: {
    bgcolor: "action.hover",
  },
  note: {
    display: "block",
    fontSize: "0.72em",
    color: "text.secondary",
    fontWeight: "normal",
    lineHeight: 1.3,
    mt: 0.25,
  },
  checkIcon: {
    fontSize: "1.1rem",
    flexShrink: 0,
    mt: 0.25,
  },
  checkIconDone: {
    color: "success.main",
  },
  checkIconEmpty: {
    color: "text.disabled",
  },
  textChecked: {
    opacity: 0.45,
    transition: "opacity 0.15s ease",
  },
  // Internal ingredient → recipe link. Color, weight, underline, and the
  // arrow are all persistent (not hover-only) so the affordance survives on
  // touch devices — hover only nudges the arrow, gated behind a
  // hover-capable-pointer query.
  preparationLink: {
    color: "ingredientLink.main",
    fontWeight: 600,
    "&:visited": {
      color: "ingredientLink.visited",
    },
    "@media (hover: hover)": {
      // translateX is authored NEGATIVE to render as a positive (rightward)
      // screen shift: stylis-plugin-rtl flips translateX's sign under the
      // page's dir="rtl" (verified precedent: HomepageAbout.style.ts
      // `readMoreLink`/`readMoreArrow`). translateY is unaffected by the
      // RTL flip (only the horizontal axis mirrors), so -1px moves up as
      // authored. Net effect: the arrow nudges 1px further outward — up and
      // screen-right — matching the direction it already points.
      "&:hover .MuiSvgIcon-root": {
        transform: "translate(-1px, -1px)",
      },
    },
    "&:focus-visible": {
      outline: "2px solid",
      outlineColor: "primary.main",
      outlineOffset: 2,
      borderRadius: "2px",
    },
  },
  // Underline lives on the text span only — not the arrow — so it doesn't
  // draw under the icon.
  preparationLinkText: {
    textDecoration: "underline",
    textDecorationColor: "currentColor",
    textDecorationThickness: "1px",
    textUnderlineOffset: "3px",
  },
  preparationLinkIcon: {
    fontSize: "14px",
    verticalAlign: "text-bottom",
    ms: "4px",
    textDecoration: "none",
    transition: "transform 0.15s ease",
  },
} as const;
