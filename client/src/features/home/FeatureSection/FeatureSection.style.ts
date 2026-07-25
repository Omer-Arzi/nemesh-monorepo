import { alpha } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";

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
    flexDirection: { xs: "column", sm: "row" },
    gap: { xs: 2, md: 3 },
  },

  // Hover is a single, coordinated "lift" gesture (translateY + a soft,
  // low-opacity shadow selling the lift) plus one independent, quieter
  // accent (the icon warming toward the brand color). Deliberately not
  // also shifting the border color on hover — with the lift+shadow already
  // signalling "hovered", a third simultaneous change felt like it started
  // stacking effects rather than reading as one calm gesture.
  //
  // Gated behind `@media (hover: hover) and (pointer: fine)` — not a width
  // breakpoint — because the actual problem is touch, not screen size: a
  // tap on a touchscreen matches `:hover` with no corresponding "pointer
  // left" event, so the card gets stuck lifted until the next tap anywhere
  // else. This media feature only matches devices with a real hover-capable
  // pointer (mouse/trackpad), correctly excluding touchscreens regardless of
  // their width (and correctly including e.g. a touchscreen laptop's
  // trackpad, unlike a width-based xs/sm/md gate would).
  card: (theme: Theme) => ({
    display: "flex",
    flex: "1 1 0%",
    minWidth: 0,
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: 1,
    p: { xs: 2, md: 2.5 },
    borderRadius: "16px",
    border: "1px solid",
    borderColor: "divider",
    bgcolor: "background.paper",
    transition: "transform 200ms ease, box-shadow 200ms ease",
    "@media (hover: hover) and (pointer: fine)": {
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: `0 4px 14px ${alpha(theme.palette.text.primary, 0.08)}`,
      },
      "&:hover .feature-card-icon": {
        color: theme.palette.primary.main,
      },
    },
  }),

  iconWrapper: {
    position: "relative",
    width: 56,
    height: 56,
    color: "text.primary",
    transition: "color 200ms ease",
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
