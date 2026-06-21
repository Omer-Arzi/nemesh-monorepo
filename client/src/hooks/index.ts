/**
 * Shared hooks barrel.
 *
 * Why hooks/ at the root: hooks that are used by more than one feature live
 * here.  Feature-specific hooks stay inside src/features/<feature>/hooks/.
 *
 * What belongs here: useDebounce, useMediaQuery wrappers, useLocalStorage,
 * useBreakpoint, useOnClickOutside, etc.
 *
 * What does NOT belong here: hooks that fetch data for a specific domain
 * (those belong in src/features/<feature>/hooks.ts).
 *
 * TODO: Add shared hooks as cross-cutting needs emerge.
 */
