import { ROUTES } from "@/constants";

/**
 * Top-level navigation items shown in the Header and mobile NavDrawer.
 *
 * Add, remove, or reorder entries here to update both surfaces at once.
 * Labels are display text; href must match an entry in src/constants/index.ts.
 *
 * TODO: Expand once all top-level sections are finalised.
 */
export type NavItem = {
  label: string;
  href: string;
};

export const NAV_ITEMS: readonly NavItem[] = [
  { label: "מתכונים", href: ROUTES.RESULTS },
  { label: "קטגוריות", href: ROUTES.CATEGORIES },
];
