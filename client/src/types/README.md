# types/

TypeScript type definitions organised by layer.

| File         | Purpose                                                              |
|--------------|----------------------------------------------------------------------|
| `api.ts`     | Wire-format shapes: Strapi envelopes, ApiError, pagination params    |
| `domain.ts`  | Business entity types after mapping from API shapes                  |
| `shared.ts`  | Generic utility types used across the whole codebase                 |

## What does NOT belong here

- Zod schemas (those live in `src/lib/validation/` or `src/features/<feature>/schemas.ts`)
- Component prop types (those live next to their component)
- Feature-specific types that are only used in one feature (keep them in `src/features/<feature>/types.ts`)
