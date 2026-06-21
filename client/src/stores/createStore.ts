import { create, type StateCreator } from "zustand";
import { devtools } from "zustand/middleware";

/**
 * Typed store factory with devtools middleware pre-applied.
 *
 * Why a factory: every store gets Redux DevTools support for free, and the
 * pattern is enforced consistently across the app rather than relying on
 * developers remembering to add middleware each time.
 *
 * Usage:
 *   import { createStore } from "@/stores/createStore";
 *
 *   type CounterState = { count: number; increment: () => void };
 *
 *   export const useCounterStore = createStore<CounterState>(
 *     "counter",
 *     (set) => ({
 *       count: 0,
 *       increment: () => set((s) => ({ count: s.count + 1 })),
 *     })
 *   );
 *
 * What belongs here: the factory function only.
 * What does NOT belong here: actual state — each domain gets its own file.
 */
export function createStore<T extends object>(
  name: string,
  initializer: StateCreator<T, [], []>
) {
  return create<T>()(devtools(initializer, { name }));
}
