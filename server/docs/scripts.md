# Nemesh Server Scripts

All scripts run from the `/server` directory.

---

## Recipe Import

### `npm run import:recipes`

Three-stage pipeline for importing recipes from DOCX files into Strapi.

**Modes:**

#### `--extract` — Parse DOCX → raw text + normalization prompt

```bash
ENABLE_RECIPE_IMPORT=true npm run import:recipes -- ./local-recipes/my-recipes.docx --extract
```

**Input:** `.docx` file  
**Output:** `scripts/import-recipes/output/<timestamp>/`
- `raw.txt` — extracted plain text
- `recipes.normalized.json` — empty template to fill
- `normalize-prompt.md` — instructions for Claude Code normalization

**Safety:** Requires `ENABLE_RECIPE_IMPORT=true`. Does not touch Strapi.

---

#### `--preview` — Validate normalized JSON

```bash
ENABLE_RECIPE_IMPORT=true npm run import:recipes -- ./scripts/import-recipes/output/<timestamp>/recipes.normalized.json --preview
```

**Input:** `recipes.normalized.json` (filled by Claude Code)  
**Output:** Prints a summary table of all recipes with slugs, counts, and warnings. Writes a `preview-<timestamp>.json` to `scripts/import-recipes/output/`.

**Safety:** Requires `ENABLE_RECIPE_IMPORT=true`. Does not touch Strapi.

---

#### `--commit` — Import into Strapi

```bash
ENABLE_RECIPE_IMPORT=true npm run import:recipes -- ./scripts/import-recipes/output/<timestamp>/recipes.normalized.json --commit
```

**Input:** `recipes.normalized.json`  
**Output:** Creates recipes in Strapi via REST API. After each recipe is created, triggers ingredient candidate creation by calling `POST /api/recipes/:documentId/process-ingredient-candidates`.

**Summary printed:**
```
  Recipes created:               N
  Recipes skipped:               N   (slug already exists)
  Recipes failed:                N
  Ingredient candidates created: N
  Ingredient candidates skipped: N   (already in catalog or duplicate)
  Candidate warnings:            N   (if any)
```

**Safety:**
- Requires `ENABLE_RECIPE_IMPORT=true`
- Requires `STRAPI_URL` and `STRAPI_IMPORT_TOKEN` env vars
- Skips recipes whose slug already exists (idempotent for duplicates)
- Continues on individual failures, exits with code 1 if any recipe failed

**Rollback:** Delete the created recipes from the Strapi admin panel.

**Token permissions required (Strapi admin → Settings → API Tokens):**
- `recipe` → `find`, `create`, `processIngredientCandidates`

---

## Ingredient Candidate Tools

### `npm run backfill:ingredient-candidates`

Retroactive backfill for `ingredientMatchCandidate` records. Scans all existing published recipes and creates missing candidates for ingredients that have not yet been processed.

```bash
ENABLE_RECIPE_IMPORT=true \
STRAPI_URL=http://localhost:1337 \
STRAPI_IMPORT_TOKEN=<token> \
npm run backfill:ingredient-candidates
```

**Input:** None (reads recipes from Strapi)  
**Output:**

```
  Recipes scanned:               N
  Ingredients scanned:           N
  Candidates created:            N
  Candidates skipped (existing): N
  Errors:                        N
```

**Safety:**
- Requires `ENABLE_RECIPE_IMPORT=true`, `STRAPI_URL`, `STRAPI_IMPORT_TOKEN`
- Read-only for recipes — only creates `ingredientMatchCandidate` records
- Safe to run multiple times — the endpoint deduplicates by recipe + normalizedText
- Continues on per-recipe errors, exits with code 1 if any errors occurred

**Rollback:** Delete the backfilled candidate records from the Strapi admin panel (filter by `reviewStatus: pending`).

**Token permissions required:**
- `recipe` → `find`, `processIngredientCandidates`

---

## Data Migration Scripts

_(None yet. Add future one-off data migrations here.)_

---

## Maintenance Scripts

_(None yet. Add future maintenance or cleanup scripts here.)_

---

## Development Utilities

### Strapi built-in scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Strapi with auto-reload (development) |
| `npm run start` | Start Strapi without auto-reload (production) |
| `npm run build` | Build the admin panel |
| `npm run strapi console` | Open Strapi REPL with full access to `strapi` object |

> **Warning:** Never run `import:recipes` or `backfill:ingredient-candidates` via `npm run dev/start/build`. Always run them as standalone `tsx` scripts.
