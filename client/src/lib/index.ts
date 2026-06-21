/**
 * Top-level lib barrel.
 * Prefer importing from the sub-module (e.g. "@/lib/api") for tree-shaking;
 * use this file only when you need a quick cross-module import.
 */
export * from "./api";
export * from "./query";
export * from "./validation";
export * from "./i18n";
// Theme is intentionally NOT re-exported here — it should only be consumed
// by the ThemeProvider, not scattered across feature code.
