# features/

Feature modules — one folder per product vertical.

## What belongs here

Each sub-folder owns everything needed to implement one product feature:
components, hooks, API service calls, Zod schemas, and (optionally) a
feature-scoped Zustand store.

```
features/
└── <feature-name>/
    ├── components/    # UI components used only by this feature
    ├── hooks.ts       # TanStack Query hooks (useQuery, useMutation)
    ├── schemas.ts     # Zod validation schemas for this feature's forms
    ├── service.ts     # API calls via apiClient — no React inside
    ├── store.ts       # (optional) Zustand slice for feature-local state
    └── types.ts       # Feature-specific types that don't belong in src/types/
```

## What does NOT belong here

- Components or hooks shared by multiple features → `src/components/` or `src/hooks/`
- Cross-cutting types → `src/types/`
- Global state → `src/stores/`

## Naming convention

Use the domain noun in singular form: `recipe`, `user`, `collection` — not
`recipes`, `userManagement`, `recipeList`.
