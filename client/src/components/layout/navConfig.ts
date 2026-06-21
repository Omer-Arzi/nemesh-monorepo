import type { ElementType } from "react";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import { ROUTES } from "@/constants";

export type NavItem = {
  label: string;
  href: string;
};

export type RailNavItem = NavItem & {
  icon: ElementType;
  action?: "surprise-me";
  neverActive?: boolean;
};

export const NAV_ITEMS: readonly NavItem[] = [
  { label: "מתכונים", href: ROUTES.RESULTS },
  { label: "קטגוריות", href: ROUTES.CATEGORIES },
];

export const RAIL_NAV_ITEMS: readonly RailNavItem[] = [
  { label: "בית", href: ROUTES.HOME, icon: HomeOutlinedIcon },
  { label: "מתכונים", href: ROUTES.RESULTS, icon: MenuBookOutlinedIcon },
  { label: "קטגוריות", href: ROUTES.CATEGORIES, icon: GridViewOutlinedIcon },
  { label: "האתגר של שיר", href: ROUTES.TAG("shir-challenge"), icon: AutoAwesomeOutlinedIcon },
  { label: "המתכונים האחרונים", href: ROUTES.RESULTS, icon: AccessTimeOutlinedIcon, neverActive: true },
  { label: "תפתיע אותי", href: ROUTES.SURPRISE_ME, icon: ShuffleIcon, action: "surprise-me" },
];
