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
│   │   ├── app/                 # App Router pages, split into (home) and (standard) route groups — see §9b
│   │   ├── components/
│   │   │   ├── domain/          # Recipe-specific UI components
│   │   │   ├── layout/          # AppShell, Header, Footer, NavDrawer
│   │   │   └── shared/          # Generic UI: EmptyState, ErrorState, LoadingState, etc.
│   │   ├── features/
│   │   │   ├── category/        # Category hooks
│   │   │   ├── cooking-mode/    # Client-only cooking mode state
│   │   │   ├── home/            # Home page feature blocks (carousel, search hero, etc.)
│   │   │   ├── page/            # Static page + footer hooks (usePage, useFooter)
│   │   │   ├── recipe/          # Recipe detail hooks
│   │   │   ├── results/         # Browse/search results hooks
│   │   │   ├── shir-challenge/  # Shir Challenge page feature (single type + special UI)
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
│   ├── src/api/                 # Collection type + single type controllers/routes/services
│   ├── src/components/          # Strapi component schemas (IngredientSection, IntroStep, etc.)
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
| Image rendering       | `NemeshImage` (shared component) + `getImageUrl` (lib/image/imageService) — see §9a |

---

## 9b. Route Groups & AppShell `pageMode`

`src/app/` is split into two route groups (organizational only — neither
appears in any URL):

```
src/app/
├── layout.tsx            # RootProviders only (Emotion, MUI theme, TanStack Query). No AppShell here.
├── (home)/
│   ├── layout.tsx         # <AppShell pageMode="home">{children}</AppShell>
│   └── page.tsx           # "/"
└── (standard)/
    ├── layout.tsx         # <AppShell pageMode="standard">{children}</AppShell>
    ├── categories/...
    ├── recipes/[slug]/...
    ├── results/...
    ├── tags/...
    └── [slug]/...
```

**Why:** `AppShell` needs to know, deterministically, whether it's rendering
the homepage — that decision controls whether the compact desktop header
starts hidden and the nav rail sits flush at the top, which is baked into
the SSR/ISR HTML for `/`. It used to derive this from `usePathname()`
inside `AppShell` (a "use client" component in the shared root layout).
In production, that resolved incorrectly during static generation/ISR
revalidation for some builds — `AppShell` would render as if it were on a
non-home route while the page content underneath was still genuinely the
homepage, baking the wrong layout into the cached static HTML. This did
not reproduce locally or in `next dev`, only against Vercel's real
ISR pipeline, and does not appear to be fixable by trusting the hook more
carefully — nothing in application code ever produced the wrong value;
the hook's own SSR-time resolution was unreliable.

Route groups sidestep this by making the mode a hardcoded literal, decided
by Next's file-system router (which `layout.tsx` matched the URL) rather
than a runtime hook read inside a shared component: `(home)/layout.tsx`
can only ever render for `/`, by construction, so `pageMode="home"` is
always correct with zero runtime inference.

**Cost:** `AppShell` (and everything inside it — `Header`,
`DesktopCompactHeader`, `NavigationRail`, `Footer`) is a separate mounted
instance per group. Crossing between `/` and any other route unmounts and
remounts it — client-side navigation *within* a group (e.g.
`/categories` → `/results`) is unaffected and fully persistent, as before.
Known regressions from this: `DesktopCompactHeader`'s search input text
resets when crossing the boundary, and its enter/exit CSS transition
doesn't play at that exact moment (it still animates normally for the
scroll-driven show/hide while browsing the homepage itself). `navRailOpen`
and `colorMode` are unaffected — they live in the Zustand `uiStore`
module, not component state, so they survive the remount.

Cosmetic `usePathname()` reads for nav-link active-state highlighting
(`NavigationItem`, `NavDrawer`, `NavLink`) are unrelated to this and were
left unchanged — they don't affect SSR-critical layout, only which link
renders bold.

---

## 9a. Image Architecture

All image rendering goes through two layers:

### URL resolution — `src/lib/api/mappers.ts`
`mapImage(StrapiMediaRaw)` converts raw Strapi media objects to the domain `Image` type. Relative Strapi paths (`/uploads/...`) are resolved to absolute URLs using `NEXT_PUBLIC_API_URL`. S3 URLs are passed through unchanged. This happens once, in the API layer — components never see raw Strapi shapes.

### URL access — `src/lib/image/imageService.ts`
`getImageUrl(image: Image | null | undefined): string | undefined` is the single point of access for retrieving a display URL from a domain Image. CDN migrations, URL transformations, or versioning strategies belong here.

### Rendering — `src/components/shared/NemeshImage`
`NemeshImage` wraps Next.js `<Image>` and accepts the domain `Image` type directly:
- Resolves `src` and `alt` automatically from the `image` prop
- Supports `fill` mode (parent must be `position: relative`) and responsive dimensions mode
- Passes `sizes`, `priority`, `className`, `style` through to Next.js Image
- Falls back to native `<img>` when intrinsic dimensions are unavailable and `fill` is not set

**All image-rendering components use `NemeshImage`.** Never use `<img>` or `<Box component="img">` for dynamic content images.

### Remote patterns — `next.config.ts`
The allowed image hostname is read from `NEXT_PUBLIC_IMAGE_HOST` (never hardcoded). Set this to your S3 bucket hostname (or CloudFront domain) in the deployment environment. Changing CDN providers only requires updating the env var.

| Environment | NEXT_PUBLIC_IMAGE_HOST |
|---|---|
| Local dev | *(unset — localhost is always allowed)* |
| Production (S3) | `nemesh-images.s3.eu-west-1.amazonaws.com` |

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

**CORS** — `config/middlewares.ts` uses a function-based origin check in production: exact matches from `CLIENT_URLS`/`CLIENT_URL` and regex patterns from `VERCEL_PREVIEW_ORIGIN_PATTERNS` are allowed; everything else is rejected. Development uses `origin: '*'`. See `docs/deployment.md` § CORS Configuration.

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

## 13. Shir Challenge Page

`/tags/shir-challenge` is handled by a **static Next.js route** (`app/(standard)/tags/shir-challenge/page.tsx`) which takes precedence over the dynamic `app/(standard)/tags/[slug]/page.tsx`. This prevents any change to existing tag-page logic. (Route group folder — see §9b — does not affect the URL.)

### Strapi single type — `shir-challenge-page`

A single type (not collection) at `server/src/api/shir-challenge-page/`. Provides admin-controlled presentation content around the monthly ingredient challenge. Fields:

| Field | Type | Notes |
|---|---|---|
| `title` | string | Page title |
| `badgeText` | string | Small pill above title |
| `subtitle` | text | Short description |
| `heroImage` | media | Cover image; objectPosition "center 42%" |
| `monthlyIngredientName` | string | Ingredient of the month |
| `monthlyIngredientDescription` | text | Context copy |
| `monthLabel` | string | e.g. "יוני 2026" |
| `myProgressStatus` | enum | idea / writing / cooked / published |
| `recipesSectionTitle` | string | Section header above recipe grid |
| `recipesSectionSubtitle` | text | Optional subtitle |
| `introSteps` | component (repeatable) | `challenge.intro-step` — title + description per step |

The **recipe list** is still driven entirely by the existing `shir-challenge` **tag** — no relation between the single type and recipes.

### Fallback behavior

Every field falls back to a Hebrew default (see `ShirChallengeDefaults` in `features/shir-challenge/ShirChallenge.consts.ts`) when the admin has not filled it in. The page renders with full default copy even if the single type document has never been saved.

### Design tokens

Peach accent palette defined in `features/shir-challenge/ShirChallenge.tokens.ts`. Used only within the shir-challenge feature boundary.

---

## 15. Static Pages CMS

Static informational pages (e.g. privacy policy, about, terms) are managed through a `page` Strapi collection type and rendered by `app/(standard)/[slug]/page.tsx`.

### Strapi collection type — `page`

Located at `server/src/api/page/`. Each document is a standalone content page.

| Field         | Type              | Notes                              |
|---------------|-------------------|------------------------------------|
| `title`       | string (required) | Page title; also used for SEO fallback |
| `slug`        | uid (required)    | URL path segment under `/`         |
| `description` | text              | Lead paragraph shown below title   |
| `content`     | blocks            | Strapi rich-text blocks editor     |
| `seo`         | component         | `shared.seo` — metaTitle + metaDescription |

SEO component defined in `server/src/components/shared/seo.json`.

### Route — `app/(standard)/[slug]/page.tsx`

A Next.js **server component**. Named segments (`/categories/`, `/recipes/`, `/results/`, `/tags/`) take priority over this dynamic segment. (Route group folder — see §9b — does not affect the URL.)

- Uses `React.cache()` to deduplicate the fetch between `generateMetadata` and the page component.
- Falls back to `notFound()` if the slug doesn't resolve.
- `generateStaticParams` pre-builds slugs at build time; a fetch failure returns `[]` (graceful degradation).

### BlockRenderer — `src/components/shared/BlockRenderer/`

Renders Strapi Blocks JSON (`BlockNode[]`) to MUI components. No third-party renderer dependency.

Supported block types: `paragraph`, `heading` (h1–h6), `list` (ordered/unordered), `quote`, `code`, `image`.
Supported inline types: `text` (bold/italic/underline/strikethrough/code), `link`.

### Feature boundary — `src/features/page/`

- `hooks.ts` — `usePage(slug)` and `useFooter()` hooks using TanStack Query.
- Query keys: `queryKeys.pages.*` and `queryKeys.footer.*`.

### Permissions (Strapi admin)

After creating the content types, enable:
- `page` → find, findOne (Public role)
- `footer` → find (Public role)

---

## 16. Footer CMS

The site footer is driven by a `footer` Strapi single type, populated via `useFooter()` in `src/features/page/hooks.ts`.

### Strapi single type — `footer`

Located at `server/src/api/footer/`. One document controls all footer content.

| Field           | Type                                     | Notes                                   |
|-----------------|------------------------------------------|-----------------------------------------|
| `sections`      | component (page.footer-section, repeatable) | Column groups of links                |
| `copyrightText` | text                                     | Falls back to `© YYYY נמש` if empty    |

Components:

**`page.footer-section`** (`server/src/components/page/footer-section.json`):
- `title` — string (required)
- `links` — `page.footer-link` (repeatable)

**`page.footer-link`** (`server/src/components/page/footer-link.json`):
- `label` — string (required)
- `page` — many-to-one relation to `page` collection (for internal links)
- `externalUrl` — string (for external links)

When `page` is set, the link renders as an internal Next.js link (`/slug`). When only `externalUrl` is set, it renders as an external link (`target="_blank"`).

### Footer component — `src/components/layout/Footer/`

Dynamic component using TanStack Query (`useFooter`, `staleTime: 10 min`). Renders gracefully with copyright-only fallback when data is unavailable or still loading.

---

## 17. Safety Notes

- **Strapi component schema changes are risky.** Renaming or removing a component field without a DB backup can cause silent data loss. Always export/backup before schema changes.
- **Do not run destructive migrations casually.** Migration scripts in `server/scripts/` are one-time operations; verify on a backup first.
- **Do not remove or rename component fields** (e.g. `ingredientSections`, `preparationSections`) without confirming the DB state and updating any migration/backfill scripts.
- **Keep this document updated** when the canonical data model changes — see the Architecture Documentation Rule in `CLAUDE.md`.
- **Strapi single type `footer`** — deleting all sections in the admin does not delete the document; it returns an empty sections array. The footer renders gracefully in this case.
- **`app/(standard)/[slug]/` catch-all route** — any new named segment at the root level (e.g. `/about/`) must be added as a directory under `app/(standard)/` **before** a `Page` with that slug is published, otherwise the dynamic segment may shadow intended behavior during ISR.
