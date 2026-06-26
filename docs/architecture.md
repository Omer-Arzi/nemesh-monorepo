# Nemesh Architecture

Hebrew RTL recipe website. Living document — update when architecture changes.

---

## 1. Project Overview

| Layer  | Technology         |
|--------|--------------------|
| Client | Next.js (App Router) |
| Server | Strapi v5          |
| DB     | PostgreSQL          |

No Anthropic/OpenAI API calls inside server or client code. Claude Code is used as an external normalization tool during the recipe import pipeline only.

---

## 2. Repository Structure

```
nemesh/
├── client/                      # Next.js frontend
│   ├── src/
│   │   ├── app/                 # App Router pages (categories, recipes, results, tags)
│   │   ├── components/
│   │   │   ├── domain/          # Recipe-specific UI components
│   │   │   ├── layout/          # AppShell, Header, Footer, NavDrawer
│   │   │   └── shared/          # Generic UI: EmptyState, ErrorState, LoadingState, etc.
│   │   ├── features/
│   │   │   ├── category/        # Category hooks
│   │   │   ├── cooking-mode/    # Client-only cooking mode state
│   │   │   ├── home/            # Home page feature blocks (carousel, search hero, etc.)
│   │   │   ├── recipe/          # Recipe detail hooks
│   │   │   ├── results/         # Browse/search results hooks
│   │   │   └── tag/             # Tag hooks
│   │   ├── lib/
│   │   │   ├── api/services/    # Strapi REST clients (recipeService, categoryService, …)
│   │   │   ├── storage/         # NemeshStorage generic localStorage service
│   │   │   └── theme/           # MUI theme definition
│   │   ├── constants/           # ROUTES, PAGINATION (shared app-wide)
│   │   ├── providers/           # React context providers (QueryClient, Theme, RTL)
│   │   ├── stores/              # Zustand stores (if any)
│   │   └── types/
│   │       ├── domain.ts        # Canonical domain types consumed by UI
│   │       └── api.ts           # Strapi wire types (only used inside lib/api/)
│   └── public/images/           # Static images (placeholders, branding, categories)
│
├── server/                      # Strapi CMS
│   ├── src/api/                 # Collection type controllers/routes/services
│   ├── src/components/          # Strapi component schemas (IngredientSection, etc.)
│   ├── scripts/                 # One-off import/migration/backfill scripts
│   │   └── import-recipes/      # DOCX → Strapi pipeline
│   ├── local-recipes/           # DOCX source files (not committed in prod)
│   └── docs/scripts.md          # Script reference (see §7 below)
│
└── docs/                        # Project-level documentation (this file)
```

---

## 3. Recipe Domain Model

The canonical `Recipe` type lives in [client/src/types/domain.ts](../client/src/types/domain.ts).

| Field                  | Type                     | Notes                                      |
|------------------------|--------------------------|--------------------------------------------|
| `id`                   | `string`                 | Maps to Strapi `documentId`                |
| `title`                | `string`                 |                                            |
| `slug`                 | `string`                 | URL-safe identifier                        |
| `image`                | `Image \| null`          |                                            |
| `categories`           | `Category[]`             | Primary navigation grouping                |
| `tags`                 | `Tag[]`                  | Secondary descriptors / collections        |
| `servings`             | `number \| null`         |                                            |
| `prepTime`             | `number \| null`         | Minutes                                    |
| `difficulty`           | `"easy" \| "medium" \| "hard" \| null` |                          |
| `description`          | `string \| null`         |                                            |
| `ingredientSections`   | `IngredientSection[]`    | **Canonical structure** (see §4)           |
| `preparationSections`  | `PreparationSection[]`   | **Canonical structure** (see §5)           |
| `tips`                 | `RecipeTip[]`            | General kitchen notes (see §6)             |
| `createdAt`            | `string`                 | ISO 8601                                   |
| `updatedAt`            | `string`                 | ISO 8601                                   |

> **Deprecated / backward-compatibility:** The original flat `ingredients` and `steps` fields still exist in the Strapi schema for backward compatibility but are not part of the canonical model. Do not use them in new code.

---

## 4. Ingredients

Ingredients are grouped into `ingredientSections`:

```ts
type IngredientSection = {
  title: string | null;     // e.g. "לבצק", "למלית", "לרוטב" — null for simple recipes
  ingredients: RecipeIngredient[];
};

type RecipeIngredient = {
  ingredientName: string | null;
  amount: number | null;
  unit: string | null;
  note: string | null;      // ingredient-specific note ONLY (e.g. "קלוי", "מגורד")
};
```

**Key rules:**
- Section titles (e.g. "למלית", "לבצק") belong in `IngredientSection.title`, **not** in `RecipeIngredient.note`.
- `RecipeIngredient.note` is for a note about that specific ingredient only.
- A recipe with a single undivided ingredient list has one section with `title: null`.

---

## 5. Preparation Steps

Steps are grouped into `preparationSections`:

```ts
type PreparationSection = {
  title: string | null;    // e.g. "לקציפה", "לרוטב" — null for simple recipes
  steps: PreparationStep[];
};

type PreparationStep = {
  description: string;
  image: Image | null;
};
```

**Key rules:**
- Step numbering is determined by display order within the section; it must remain stable.
- Sections with `title: null` are rendered as a flat numbered list.

---

## 6. Tips

```ts
type RecipeTip = { text: string };
```

- `recipe.tips` are general recipe notes, displayed as **"הערות מהמטבח"**.
- They are **not** the same as `RecipeIngredient.note` (which is per-ingredient).

---

## 7. Recipe Import Pipeline

```
DOCX file
  └─→ --extract   (parse raw text + generate normalization prompt)
        └─→ Claude Code normalization (manual, outside code)
              └─→ recipes.normalized.json
                    └─→ --preview   (validate, print summary table)
                          └─→ --commit  (POST to Strapi REST API)
```

- No Anthropic/OpenAI API is called in any server or client code.
- Normalization is done interactively through Claude Code by the developer.
- After commit, ingredient candidates are created automatically via `POST /api/recipes/:documentId/process-ingredient-candidates`.
- Full script reference: [server/docs/scripts.md](../server/docs/scripts.md).

---

## 8. Ingredient Matching

```ts
// IngredientCatalogItem — canonical ingredient vocabulary
type IngredientCatalogItem = BaseEntity & {
  canonicalName: string;
  slug: string;
  variants: string[] | null;
  approvalStatus: "approved" | "pending";
  notes: string | null;
};
```

- `ingredientMatchCandidate` records are created after import or backfill — they link a recipe ingredient to a catalog item candidate.
- Candidates are reviewed and approved/rejected via the Strapi admin panel.
- Do not duplicate ingredient matching logic; all matching flows through the `processIngredientCandidates` endpoint.

---

## 9. Client Architecture

| Concern               | Convention                                                                 |
|-----------------------|----------------------------------------------------------------------------|
| UI framework          | MUI (Material UI)                                                          |
| Styling               | `ComponentName.style.ts` colocated with component; MUI `sx` only          |
| UI strings            | `ComponentName.consts.ts` colocated with component; `src/constants/` only for truly shared strings |
| Language / layout     | Hebrew RTL; all layouts must be RTL-compatible                            |
| Data fetching         | TanStack Query; query keys centralized; custom hooks per feature           |
| API isolation         | `src/lib/api/services/` maps Strapi responses → domain types; components consume domain types only |
| Routing               | Next.js App Router; routes centralized in `src/constants/ROUTES`          |
| Domain types          | `src/types/domain.ts` — single source of truth for UI                     |
| API wire types        | `src/types/api.ts` — only used inside `src/lib/api/`                      |

**Component structure:**
```
ComponentName/
├── ComponentName.tsx
├── ComponentName.style.ts    # styles
├── ComponentName.consts.ts   # user-facing strings
└── index.ts
```

---

## 10. localStorage Architecture

All client-side persistence goes through `NemeshStorage` ([client/src/lib/storage/NemeshStorage.ts](../client/src/lib/storage/NemeshStorage.ts)).

**Key format:** `nemesh:v1:<feature>:<key>`

- Feature code never constructs key strings manually — only `NemeshStorage` builds keys.
- To bump the storage schema, increment `STORAGE_VERSION` in `NemeshStorage.ts` and add migration logic there.
- Supports optional TTL (`expiresInMs`).

**Current features using storage:**

| Feature        | Key                  | TTL      |
|----------------|----------------------|----------|
| `cooking-mode` | `<recipeId>`         | 48 hours |

---

## 11. Cooking Mode

- Client-only feature; no DB, no API, no auth.
- Managed by `useCookingMode` in `src/features/cooking-mode/`.
- Persisted to `NemeshStorage` under feature `"cooking-mode"` keyed by recipe `documentId`.
- Tracks which ingredients and preparation steps the user has checked off.
- Does **not** modify recipe data.
- Step/ingredient keys are derived from display order; numbering must remain stable across recipe edits.
- State expires after 48 hours.

---

## 12. Deployment & Storage

| Environment | Database | File Uploads | Notes |
|---|---|---|---|
| Development | Local PostgreSQL | Local disk (`public/uploads/`) | Default Strapi behavior |
| Production | Railway PostgreSQL | AWS S3 | Activated by `NODE_ENV=production` |

**Upload provider selection** — `config/plugins.ts` gates S3 on `NODE_ENV === 'production'`. In development, no upload plugin is configured and Strapi falls back to local disk.

**CORS** — `config/middlewares.ts` restricts to `CLIENT_URL` in production. Development allows all origins.

**Required production env vars (non-secret):**

| Var | Example value |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_CLIENT` | `postgres` |
| `DATABASE_URL` | injected by Railway |
| `DATABASE_SSL` | `true` |
| `DATABASE_SSL_REJECT_UNAUTHORIZED` | `false` |
| `AWS_REGION` | `eu-central-1` |
| `AWS_BUCKET` | your bucket name |
| `AWS_BUCKET_URL` | `https://<bucket>.s3.<region>.amazonaws.com` |
| `CLIENT_URL` | Vercel deployment URL |

Full Railway + S3 setup steps: [docs/deployment.md](./deployment.md).

---

## 13. Safety Notes

- **Strapi component schema changes are risky.** Renaming or removing a component field without a DB backup can cause silent data loss. Always export/backup before schema changes.
- **Do not run destructive migrations casually.** Migration scripts in `server/scripts/` are one-time operations; verify on a backup first.
- **Do not remove or rename component fields** (e.g. `ingredientSections`, `preparationSections`) without confirming the DB state and updating any migration/backfill scripts.
- **Keep this document updated** when the canonical data model changes — see the Architecture Documentation Rule in `CLAUDE.md`.
