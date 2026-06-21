# constants/

Application-wide constants and magic-value elimination.

## What belongs here

- Route path strings (`ROUTES`)
- Default pagination limits
- `localStorage` key names
- Feature flag identifiers
- Date/time format strings

## What does NOT belong here

- Environment-specific values → `.env` + `src/lib/api/config.ts`
- Styling values → use MUI theme tokens via `useTheme()` or `sx`
- Business logic or derived values
