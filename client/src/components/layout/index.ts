/**
 * Layout components — structural shells, not business UI.
 *
 * What belongs here: AppShell, Header, Footer, navigation primitives,
 * page-level structural wrappers.
 *
 * What does NOT belong here: feature-specific UI or data-fetching.
 */
export { default as AppShell } from "./AppShell";
export { default as Header } from "./Header";
export { default as Footer } from "./Footer";
export { default as NavLink } from "./NavLink";
export { default as NavDrawer } from "./NavDrawer";
export type { NavItem } from "./navConfig";
export { NAV_ITEMS } from "./navConfig";
