# hooks/

Shared custom React hooks.

## What belongs here

Hooks that are used by more than one feature: `useDebounce`, `useMediaQuery`
wrappers, `useLocalStorage`, `useOnClickOutside`, `useBreakpoint`, etc.

## What does NOT belong here

- Hooks that fetch data for a specific feature → `src/features/<feature>/hooks.ts`
- Hooks that only wrap a single Zustand store slice → keep them co-located
  with the store
