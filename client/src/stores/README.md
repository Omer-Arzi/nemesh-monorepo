# stores/

Global client-side state via Zustand.

## What belongs here

State that must be shared across features and is **not** server data:
UI preferences (colour mode, sidebar open/close), session-level flags, etc.

## What does NOT belong here

- Server / API data → use TanStack Query (`src/lib/query/`)
- State needed by only one feature → keep it in
  `src/features/<feature>/store.ts` or plain `useState`

## Adding a new store

1. Create `src/stores/<domain>Store.ts`
2. Use the `createStore` factory from `./createStore` to get devtools for free
3. Export from `src/stores/index.ts`

```ts
// Example
import { createStore } from "./createStore";

type MyState = { value: string; setValue: (v: string) => void };

export const useMyStore = createStore<MyState>("myStore", (set) => ({
  value: "",
  setValue: (v) => set({ value: v }),
}));
```
