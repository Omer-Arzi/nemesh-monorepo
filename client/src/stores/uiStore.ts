import { createStore } from "./createStore";

/**
 * Global UI state — theme mode, sidebar open/close, modal management, etc.
 *
 * Why a dedicated UI store: UI state (drawer open, snackbar message) is
 * global but has nothing to do with server data.  Mixing it into a domain
 * store makes both harder to reason about.
 *
 * What belongs here: cross-cutting UI flags that multiple components need.
 *
 * What does NOT belong here: server/API data (use TanStack Query for that)
 * or per-feature state that only one subtree needs (keep it local with
 * useState or a feature-scoped store in src/features/<feature>/store.ts).
 *
 * TODO: Expand with actual UI requirements as features are built.
 */

type ColorMode = "light" | "dark";

type UiState = {
  colorMode: ColorMode;
  toggleColorMode: () => void;
  navRailOpen: boolean;
  toggleNavRail: () => void;
};

export const useUiStore = createStore<UiState>("ui", (set) => ({
  colorMode: "light",
  toggleColorMode: () =>
    set((state) => ({
      colorMode: state.colorMode === "light" ? "dark" : "light",
    })),
  navRailOpen: true,
  toggleNavRail: () => set((state) => ({ navRailOpen: !state.navRailOpen })),
}));
