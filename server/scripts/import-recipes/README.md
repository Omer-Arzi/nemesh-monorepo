# Recipe Import Pipeline

A CLI tool for importing recipes from DOCX files into the Nemesh Strapi backend.

The pipeline separates extraction, normalization, and import into discrete steps.
Normalization is done manually using Claude Code — no API keys are required.

---

## Workflow overview

```
1. --extract    DOCX → raw text + normalization prompt for Claude Code
2. (manual)     Claude Code fills recipes.normalized.json
3. --preview    Validate + review the normalized JSON before touching Strapi
4. --commit     Import validated recipes into Strapi via REST API
```

---

## Required environment variables

| Variable | When required | Description |
|---|---|---|
| `ENABLE_RECIPE_IMPORT` | All modes | Must be `true`. Safety gate against accidental runs. |
| `STRAPI_URL` | `--commit` only | Strapi base URL, e.g. `http://localhost:1337`. |
| `STRAPI_IMPORT_TOKEN` | `--commit` only | Strapi API token with Create access on the Recipe collection. |

No LLM API key is required anywhere in this pipeline.

Set these in `server/.env` or export them in your shell.

---

## Step 1 — Extract (`--extract`)

```bash
npm run import:recipes -- ./path/to/recipes.docx --extract
```

Creates a timestamped folder under `scripts/import-recipes/output/YYYY-MM-DD-HH-mm/` containing:

| File | Purpose |
|---|---|
| `raw.txt` | Plain text extracted from the DOCX |
| `normalize-prompt.md` | Instructions for Claude Code to fill the JSON |
| `recipes.normalized.json` | Empty array `[]` — Claude Code will populate this |

Does not write to Strapi. Does not require `STRAPI_URL` or `STRAPI_IMPORT_TOKEN`.

---

## Step 2 — Normalize (manual, using Claude Code)

Open `normalize-prompt.md` in Claude Code. The file contains:
- The path to `raw.txt` (source text)
- The path to `recipes.normalized.json` (target file)
- The exact JSON schema each recipe must follow
- Rules for handling missing fields, Hebrew text, and multi-recipe documents

Claude Code will read the raw text, identify recipe boundaries, extract structured data, and write the result to `recipes.normalized.json`.

Review the output before proceeding. Edit it manually if needed.

---

## Step 3 — Preview (`--preview`)

```bash
npm run import:recipes -- ./output/YYYY-MM-DD-HH-mm/recipes.normalized.json --preview
```

- Reads and validates the normalized JSON.
- Generates slugs for any recipe missing one (transliterated from the Hebrew title).
- Ensures all slugs are unique within the file.
- Prints a summary: recipe titles, slugs, ingredient/step counts, warnings.
- Writes a validated JSON file to `output/preview-YYYY-MM-DD-HH-mm.json`.

Does not write to Strapi. Does not require `STRAPI_URL` or `STRAPI_IMPORT_TOKEN`.

---

## Step 4 — Commit (`--commit`)

```bash
npm run import:recipes -- ./output/YYYY-MM-DD-HH-mm/recipes.normalized.json --commit
```

- Validates and slugifies (same as `--preview`).
- Checks each slug against Strapi — skips recipes that already exist.
- POSTs new recipes to `POST /api/recipes`.
- Continues if a single recipe fails — does not abort the whole batch.
- Prints a final summary: created / skipped / failed counts.
- Exits with code 1 if any recipe failed.

Recipes are created as **drafts** in Strapi. Publish them from the admin panel after reviewing.

---

## How slugs are generated

Hebrew recipe titles are transliterated to ASCII using a character-by-character mapping.

Example: `עוגת תפוחים` → `agat-tapvchim`

Duplicate titles within the same batch get a numeric suffix: `-2`, `-3`, etc.

If a recipe in the JSON already has a `slug` field, it is used as-is (after uniqueness check).

---

## Multi-recipe DOCX files

If the DOCX contains multiple recipes, Claude Code will identify recipe boundaries automatically from the text. Clear section headers or recipe titles improve accuracy, but are not required.

---

## What is NOT imported

- **Images** — not supported.
- **Tags** — always `[]`.
- **Categories** — always `[]` (unless Claude Code is instructed to fill them).
- **IngredientCatalogItem relations** — ingredients are stored by name only (`ingredientName`).

---

## Safety notes

- The script will not run without `ENABLE_RECIPE_IMPORT=true`. This prevents accidental execution.
- The script is not wired to `npm start`, `npm run dev`, or `npm run build`.
- Existing recipes (matched by slug) are **never modified** — they are skipped.
- `--commit` is the only mode that writes to Strapi.
- Always run `--preview` before `--commit` to review the import.

---

## Setting up a Strapi API token

1. Go to Strapi admin → Settings → API Tokens → Create new token.
2. Set type to **Custom**.
3. Grant **Create** permission on the `Recipe` collection.
4. Copy the token and set it as `STRAPI_IMPORT_TOKEN` in `server/.env`.

---

## Example `.env` entries

```env
ENABLE_RECIPE_IMPORT=true
STRAPI_URL=http://localhost:1337
STRAPI_IMPORT_TOKEN=your-strapi-api-token-here
```
