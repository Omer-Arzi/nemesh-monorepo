# Nemesh Frontend Conventions

## Component Structure

Each reusable component must live in its own directory.

Structure:

```text
ComponentName/
├── ComponentName.tsx
├── ComponentName.style.ts
└── index.ts
```

Example:

```text
RecipeCard/
├── RecipeCard.tsx
├── RecipeCard.style.ts
└── index.ts
```

## Component Styling

All UI component styles must be colocated with the component.

The style file must export a single style object named after the component.

Example:

```ts
export const RecipeCardStyle = {
  root: {},
  image: {},
  title: {},
  content: {},
};
```

Usage:

```tsx
<Box sx={RecipeCardStyle.root}>
```

Rules:

* Prefer MUI `sx`.
* Do not use CSS Modules.
* Do not use styled-components.
* Do not create shared component style directories.
* Do not place large style objects inline inside components.
* Keep styles colocated with their component.
* In sx objects, order properties so `display` comes first (if present), then `position` second (if present). Do not add either property just to satisfy the order — only order them correctly when they already exist.
* Use semantic style names:

  * root
  * image
  * title
  * content
  * actions
  * metadata
  * etc.
* Use theme-aware values whenever possible.
* Each component directory must include an `index.ts`.

## Design System

* Use Material UI.
* Use the existing theme.
* Do not hardcode brand colors.
* Use theme tokens whenever possible.
* Prefer consistency over custom styling.
* Theme changes should be implemented through the theme system, not component-level overrides.

## RTL

* Hebrew is the primary language.
* All layouts and components must be RTL-compatible.
* Do not make LTR-only assumptions.
* Test spacing and alignment with Hebrew content.

## Architecture

### Domain Types

Domain entities belong in:

```text
src/types/domain.ts
```

Examples:

* Recipe
* Category
* RecipeIngredient
* PreparationStep

### API Types

Wire/API types belong in:

```text
src/types/api.ts
```

Examples:

* Strapi response types
* Pagination types
* API DTOs

### Component Boundaries

* Components should consume domain types.
* Components should not depend directly on Strapi response shapes.
* Mapping from API types to domain types should happen in services or adapters.

### Services

Services are responsible for API communication.

Examples:

```text
src/lib/api/services/
```

* recipeService
* categoryService
* searchService

## Data Fetching

* Use TanStack Query.
* Keep query keys centralized.
* Keep page components thin.
* Prefer custom hooks over duplicating query logic.

## Repository Structure

```text
nemesh/
├── client/
└── server/
```

## Working Rules

For frontend tasks:

* Primary working directory: `client/`
* You may inspect files inside `server/`
* Use `server/` as the source of truth for:

  * Strapi content types
  * API contracts
  * Route definitions
  * Field names
  * Enums
  * Validation rules

## Modification Rules

Allowed:

* Create files inside `client/`
* Edit files inside `client/`
* Move files inside `client/`
* Delete files inside `client/`

Not allowed:

* Modify files inside `server/`
* Rename files inside `server/`
* Reformat files inside `server/`

If a frontend task requires a backend change:

1. Stop.
2. Explain the required backend change.
3. Wait for confirmation.
4. Do not implement the backend change automatically.

## Frontend Data Modeling

Before creating frontend types, services, or integrations:

1. Inspect the relevant Strapi schema in `server/`.
2. Reuse the real field names.
3. Do not invent fields.
4. Do not assume endpoint behavior.
5. Prefer existing backend contracts over assumptions.

## Before Making Changes

Always:

1. Inspect the existing implementation.
2. Follow established project conventions.
3. Reuse existing patterns.
4. Avoid introducing alternative patterns unless explicitly requested.
5. Explain the implementation plan before making large structural changes.

## Code Quality

* Prefer readability over cleverness.
* Prefer explicit naming.
* Avoid unnecessary abstractions.
* Keep components focused on a single responsibility.
* Keep files reasonably small.
* Reuse existing patterns before introducing new ones.

## Image and Asset Conventions

### Directory structure

```text
client/
├── public/
│   └── images/
│       ├── placeholders/   # fallback images (recipe, category, tag)
│       ├── branding/       # logo, Open Graph, static identity images
│       └── categories/     # optional static category hero images
└── src/
    └── assets/
        ├── icons/          # SVG icons imported into components
        └── illustrations/  # decorative illustrations imported into code
```

### Rules

* Use `public/images/placeholders/` for fallback and placeholder images.
* Use `public/images/branding/` for brand, logo, and static identity images.
* Use `public/images/categories/` for category-related static fallback images.
* Use `src/assets/icons/` for SVG icons imported directly into components.
* Use `src/assets/illustrations/` for imported decorative illustrations.
* Do not place large image assets directly inside component directories.
* Do not hard-code external image URLs for local assets.
* Prefer `public/` when the image should be referenced by URL (e.g. `<img src="/images/placeholders/recipe.jpg">`).
* Prefer `src/assets/` when the asset is imported into code (e.g. `import Logo from "@/assets/icons/logo.svg"`).

## Architecture Documentation Rule

When making architectural changes, update `docs/architecture.md` at the repo root.

Architectural changes include:

* Data model changes (new fields, renamed types, removed entities)
* Strapi schema changes
* Import pipeline changes
* localStorage / storage changes (new features, key format, TTL)
* Routing or layout changes
* Major feature boundary changes (new top-level feature folder, restructured component tree)

If a change adds or modifies custom scripts, update `server/docs/scripts.md` as well.

At the end of each relevant task, note whether `docs/architecture.md` or `docs/scripts.md` were updated, or explain briefly why they were not needed.

---

## Theme Philosophy

Nemesh should feel:

* Warm
* Human
* Welcoming
* Handmade
* Editorial
* Premium but approachable

Avoid:

* Cold corporate aesthetics
* Startup blue design language
* Neon colors
* Overly saturated palettes
* Excessive visual noise
