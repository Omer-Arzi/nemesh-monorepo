# lib/

Framework-level infrastructure and third-party integrations.

## Sub-modules

| Folder       | Purpose                                                           |
|--------------|-------------------------------------------------------------------|
| `api/`       | HTTP client, base config, per-resource service files              |
| `query/`     | TanStack Query client factory and centralised query key registry  |
| `theme/`     | MUI theme composition (palette, typography, component overrides)  |
| `validation/`| Zod primitive schemas and RHF resolver re-export                  |

## What belongs here

Infrastructure that doesn't know about any specific product feature: auth
token injection, request retries, theme tokens, validation primitives.

## What does NOT belong here

Business logic, data transformations tied to a specific domain, or any
React components (those belong in `src/components/` or `src/features/`).
