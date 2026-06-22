/**
 * Retroactive backfill for ingredientMatchCandidate records.
 *
 * Fetches existing recipes from Strapi and creates missing ingredient match
 * candidates for each recipe's ingredients. Safe to run multiple times —
 * the process-ingredient-candidates endpoint deduplicates by recipe + normalizedText.
 *
 * Usage:
 *   npm run backfill:ingredient-candidates
 *
 * Required env vars:
 *   ENABLE_RECIPE_IMPORT=true
 *   STRAPI_URL=http://localhost:1337
 *   STRAPI_IMPORT_TOKEN=<token>
 */

import path from "path";

// Load .env from the server root if present.
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
} catch {
  // dotenv is optional — env vars may be set externally.
}

// ── Safety gate ───────────────────────────────────────────────────────────────

if (process.env.ENABLE_RECIPE_IMPORT !== "true") {
  console.error(
    '\n[backfill] ERROR: ENABLE_RECIPE_IMPORT is not set to "true".\n' +
      "Set ENABLE_RECIPE_IMPORT=true before running this script.\n"
  );
  process.exit(1);
}

const missing: string[] = [];
if (!process.env.STRAPI_URL) missing.push("STRAPI_URL");
if (!process.env.STRAPI_IMPORT_TOKEN) missing.push("STRAPI_IMPORT_TOKEN");
if (missing.length > 0) {
  console.error(`[backfill] ERROR: Missing env vars: ${missing.join(", ")}`);
  process.exit(1);
}

const STRAPI_URL = process.env.STRAPI_URL!;
const TOKEN = process.env.STRAPI_IMPORT_TOKEN!;
const PAGE_SIZE = 100;

// ── Types ─────────────────────────────────────────────────────────────────────

type StrapiRecipe = {
  id: number;
  documentId: string;
  title: string;
  ingredients: Array<{ ingredientName: string | null }>;
};

type StrapiListResponse = {
  data: StrapiRecipe[];
  meta: { pagination: { page: number; pageCount: number; total: number } };
};

// ── Helpers ───────────────────────────────────────────────────────────────────

async function fetchRecipePage(page: number): Promise<StrapiListResponse> {
  const url =
    `${STRAPI_URL}/api/recipes` +
    `?populate[ingredients][fields][0]=ingredientName` +
    `&pagination[page]=${page}` +
    `&pagination[pageSize]=${PAGE_SIZE}` +
    `&status=published`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch recipes page ${page} (HTTP ${res.status})`);
  }

  return res.json() as Promise<StrapiListResponse>;
}

async function triggerCandidates(
  recipe: StrapiRecipe
): Promise<{ created: number; skipped: number } | null> {
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/recipes/${recipe.documentId}/process-ingredient-candidates`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${TOKEN}` },
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.warn(
        `  [warn] "${recipe.title}" (${recipe.documentId}) — HTTP ${res.status}: ${errText}`
      );
      return null;
    }

    const body = (await res.json()) as { data: { created: number; skipped: number } };
    return body.data;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`  [warn] "${recipe.title}" (${recipe.documentId}) — ${message}`);
    return null;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n[backfill] Starting ingredient candidate backfill...\n");

  let recipesScanned = 0;
  let ingredientsScanned = 0;
  let totalCreated = 0;
  let totalSkipped = 0;
  let errors = 0;

  let page = 1;
  let pageCount = 1;

  while (page <= pageCount) {
    const response = await fetchRecipePage(page);
    pageCount = response.meta.pagination.pageCount;

    console.log(
      `[backfill] Page ${page}/${pageCount} — ${response.data.length} recipes`
    );

    for (const recipe of response.data) {
      recipesScanned++;
      const ingredientCount = recipe.ingredients.filter((i) => i.ingredientName).length;
      ingredientsScanned += ingredientCount;

      const result = await triggerCandidates(recipe);

      if (result) {
        totalCreated += result.created;
        totalSkipped += result.skipped;
        if (result.created > 0) {
          console.log(
            `  [ok] "${recipe.title}" — ${result.created} created, ${result.skipped} skipped`
          );
        }
      } else {
        errors++;
      }
    }

    page++;
  }

  console.log(
    "\n── Backfill complete ─────────────────────────────────────────\n" +
      `  Recipes scanned:               ${recipesScanned}\n` +
      `  Ingredients scanned:           ${ingredientsScanned}\n` +
      `  Candidates created:            ${totalCreated}\n` +
      `  Candidates skipped (existing): ${totalSkipped}\n` +
      `  Errors:                        ${errors}\n` +
      "─────────────────────────────────────────────────────────────\n"
  );

  if (errors > 0) {
    console.error("[backfill] Some recipes had errors. See warnings above.");
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error(
    "\n[backfill] Fatal error:",
    err instanceof Error ? err.message : err
  );
  process.exit(1);
});
