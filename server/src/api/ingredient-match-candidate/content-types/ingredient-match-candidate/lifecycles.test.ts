import { test } from 'node:test';
import assert from 'node:assert/strict';
import lifecycles from './lifecycles';

const CANDIDATE_UID = 'api::ingredient-match-candidate.ingredient-match-candidate';
const CATALOG_UID = 'api::ingredient-catalog-item.ingredient-catalog-item';

function createFakeStrapi({ candidate, ingredient }: { candidate: any; ingredient: any }) {
  const ingredientUpdateCalls: Array<{ documentId: string; data: any }> = [];
  let currentIngredient = ingredient;

  (global as any).strapi = {
    log: { info: () => {}, warn: () => {}, error: () => {} },
    documents: (uid: string) => {
      if (uid === CANDIDATE_UID) {
        return {
          findOne: async ({ documentId }: { documentId: string }) =>
            candidate.documentId === documentId ? candidate : null,
        };
      }

      if (uid === CATALOG_UID) {
        return {
          findOne: async ({ documentId }: { documentId: string }) =>
            currentIngredient && currentIngredient.documentId === documentId
              ? { ...currentIngredient }
              : null,
          update: async ({ documentId, data }: { documentId: string; data: any }) => {
            ingredientUpdateCalls.push({ documentId, data });
            currentIngredient = { ...currentIngredient, ...data };
            return { ...currentIngredient };
          },
        };
      }

      throw new Error(`Unexpected uid: ${uid}`);
    },
  };

  return { ingredientUpdateCalls, getIngredient: () => currentIngredient };
}

test('afterUpdate uses the submitted ingredientName (result), not the candidate\'s stored normalizedText', async () => {
  // The stored normalizedText is deliberately stale/lossy (final Hebrew letters
  // stripped by the matching-key normalizer), simulating what a re-fetch of the
  // candidate would still contain. The admin's actually-approved value lives on
  // ingredientName in the update result.
  const candidate = {
    documentId: 'candidate-1',
    matchType: 'variant',
    ingredientName: 'בצלים סגולים',
    normalizedText: 'בצלימ סגולימ',
    selectedIngredient: { documentId: 'ingredient-1' },
  };

  const { ingredientUpdateCalls, getIngredient } = createFakeStrapi({
    candidate,
    ingredient: { documentId: 'ingredient-1', canonicalName: 'בצל סגול', variants: null },
  });

  const result = {
    documentId: 'candidate-1',
    reviewStatus: 'approved',
    ingredientName: 'בצלים סגולים',
    normalizedText: 'בצלימ סגולימ',
  };

  await lifecycles.afterUpdate({ result, state: { previousReviewStatus: 'pending' } });

  assert.equal(ingredientUpdateCalls.length, 1);
  assert.deepEqual(getIngredient()?.variants, ['בצלים סגולים']);
});

test('afterUpdate is a no-op when the transition is not into "approved"', async () => {
  const candidate = {
    documentId: 'candidate-1',
    matchType: 'variant',
    ingredientName: 'בצלים סגולים',
    normalizedText: 'בצלימ סגולימ',
    selectedIngredient: { documentId: 'ingredient-1' },
  };

  const { ingredientUpdateCalls } = createFakeStrapi({
    candidate,
    ingredient: { documentId: 'ingredient-1', canonicalName: 'בצל סגול', variants: null },
  });

  const result = {
    documentId: 'candidate-1',
    reviewStatus: 'approved',
    ingredientName: 'בצלים סגולים',
  };

  // Already approved previously — this update is unrelated to the approval transition
  // (e.g. an adminNotes edit) and must not re-trigger the variant side effect.
  await lifecycles.afterUpdate({ result, state: { previousReviewStatus: 'approved' } });

  assert.equal(ingredientUpdateCalls.length, 0);
});

test('afterUpdate skips the variant update when ingredientName is blank', async () => {
  const candidate = {
    documentId: 'candidate-1',
    matchType: 'variant',
    ingredientName: '   ',
    normalizedText: 'בצלימ סגולימ',
    selectedIngredient: { documentId: 'ingredient-1' },
  };

  const { ingredientUpdateCalls } = createFakeStrapi({
    candidate,
    ingredient: { documentId: 'ingredient-1', canonicalName: 'בצל סגול', variants: ['בצל אדום'] },
  });

  const result = {
    documentId: 'candidate-1',
    reviewStatus: 'approved',
    ingredientName: '   ',
  };

  await lifecycles.afterUpdate({ result, state: { previousReviewStatus: 'pending' } });

  assert.equal(ingredientUpdateCalls.length, 0);
});
