import { test } from 'node:test';
import assert from 'node:assert/strict';
import { processRecipeIngredients } from './processor';

const CATALOG_UID = 'api::ingredient-catalog-item.ingredient-catalog-item';
const CANDIDATE_UID = 'api::ingredient-match-candidate.ingredient-match-candidate';

type FakeCandidate = {
  documentId: string;
  ingredientName: string;
  recipe: string;
  normalizedText: string;
  reviewStatus: 'pending' | 'approved' | 'rejected';
};

/**
 * Fake strapi covering just what processor.ts touches:
 *  - documents(CATALOG_UID).findMany  → findMatch's exact-match scan (empty catalog by default)
 *  - documents(CANDIDATE_UID).findFirst/create/delete
 *  - db.connection.raw               → findFuzzySuggestion (no fuzzy hits by default)
 */
function createFakeStrapi(initialCandidates: FakeCandidate[] = []) {
  const candidates = [...initialCandidates];
  const createCalls: any[] = [];
  const deleteCalls: string[] = [];

  const strapi = {
    log: { info: () => {}, warn: () => {}, error: () => {} },
    db: { connection: { raw: async () => ({ rows: [] }) } },
    documents: (uid: string) => {
      if (uid === CATALOG_UID) {
        return { findMany: async () => [] };
      }
      if (uid === CANDIDATE_UID) {
        return {
          findFirst: async ({ filters }: any) => {
            const recipeId = filters.recipe.documentId;
            const status = filters.reviewStatus;
            return (
              candidates.find(
                (c) =>
                  c.recipe === recipeId &&
                  c.normalizedText === filters.normalizedText &&
                  (status === undefined || c.reviewStatus === status)
              ) ?? null
            );
          },
          create: async ({ data }: any) => {
            createCalls.push(data);
            const created: FakeCandidate = {
              documentId: `candidate-${candidates.length + 1}`,
              ingredientName: data.ingredientName,
              recipe: data.recipe,
              normalizedText: data.normalizedText,
              reviewStatus: 'pending',
            };
            candidates.push(created);
            return created;
          },
          delete: async ({ documentId }: any) => {
            deleteCalls.push(documentId);
            const idx = candidates.findIndex((c) => c.documentId === documentId);
            if (idx >= 0) candidates.splice(idx, 1);
          },
        };
      }
      throw new Error(`Unexpected uid: ${uid}`);
    },
  } as any;

  return { strapi, candidates, createCalls, deleteCalls };
}

test('an occurrence with hasPreparationRecipe never creates a candidate', async () => {
  const { strapi, createCalls } = createFakeStrapi();

  const result = await processRecipeIngredients(strapi, 'recipe-1', [
    { ingredientName: 'ריבת לימון', hasPreparationRecipe: true },
  ]);

  assert.equal(createCalls.length, 0);
  assert.equal(result.created, 0);
  assert.equal(result.skipped, 1);
  assert.equal(result.invalidated, 0);
});

test('linking a preparationRecipe invalidates an existing pending candidate for the same occurrence', async () => {
  const { strapi, candidates, deleteCalls } = createFakeStrapi([
    {
      documentId: 'candidate-old',
      ingredientName: 'ריבת לימון',
      recipe: 'recipe-1',
      normalizedText: 'ריבת לימונ',
      reviewStatus: 'pending',
    },
  ]);

  const result = await processRecipeIngredients(strapi, 'recipe-1', [
    { ingredientName: 'ריבת לימון', hasPreparationRecipe: true },
  ]);

  assert.deepEqual(deleteCalls, ['candidate-old']);
  assert.equal(candidates.length, 0);
  assert.equal(result.invalidated, 1);
});

test('an approved candidate is never deleted, even for a now-linked occurrence', async () => {
  const { strapi, candidates, deleteCalls } = createFakeStrapi([
    {
      documentId: 'candidate-approved',
      ingredientName: 'ריבת לימון',
      recipe: 'recipe-1',
      normalizedText: 'ריבת לימונ',
      reviewStatus: 'approved',
    },
  ]);

  const result = await processRecipeIngredients(strapi, 'recipe-1', [
    { ingredientName: 'ריבת לימון', hasPreparationRecipe: true },
  ]);

  assert.deepEqual(deleteCalls, []);
  assert.equal(candidates.length, 1);
  assert.equal(result.invalidated, 0);
});

test('a candidate belonging to a different recipe is untouched', async () => {
  const { strapi, candidates, deleteCalls } = createFakeStrapi([
    {
      documentId: 'candidate-other-recipe',
      ingredientName: 'ריבת לימון',
      recipe: 'recipe-999',
      normalizedText: 'ריבת לימונ',
      reviewStatus: 'pending',
    },
  ]);

  await processRecipeIngredients(strapi, 'recipe-1', [
    { ingredientName: 'ריבת לימון', hasPreparationRecipe: true },
  ]);

  assert.deepEqual(deleteCalls, []);
  assert.equal(candidates.length, 1);
});

test('unlinked occurrences still go through normal candidate creation, unaffected by linked ones', async () => {
  const { strapi, createCalls } = createFakeStrapi();

  const result = await processRecipeIngredients(strapi, 'recipe-1', [
    { ingredientName: 'ריבת לימון', hasPreparationRecipe: true },
    { ingredientName: 'קמח', hasPreparationRecipe: false },
  ]);

  assert.equal(createCalls.length, 1);
  assert.equal(createCalls[0].ingredientName, 'קמח');
  assert.equal(result.created, 1);
  assert.equal(result.skipped, 1);
});

test('blank ingredient names are skipped without touching candidates', async () => {
  const { strapi, createCalls, deleteCalls } = createFakeStrapi();

  const result = await processRecipeIngredients(strapi, 'recipe-1', [
    { ingredientName: '   ', hasPreparationRecipe: false },
  ]);

  assert.equal(createCalls.length, 0);
  assert.equal(deleteCalls.length, 0);
  assert.equal(result.created, 0);
});
