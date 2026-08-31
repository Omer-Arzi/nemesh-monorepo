import { test } from 'node:test';
import assert from 'node:assert/strict';
import lifecycles from './lifecycles';

const RECIPE_ID = 'recipe-1';
const OTHER_ID = 'recipe-2';

function dataWithPreparationRecipe(preparationRecipe: unknown) {
  return {
    ingredientSections: [
      {
        ingredients: [{ ingredientName: 'ריבת לימון', preparationRecipe }],
      },
    ],
  };
}

test('beforeUpdate rejects a bare-documentId-string self-reference', async () => {
  await assert.rejects(() =>
    lifecycles.beforeUpdate({
      params: { documentId: RECIPE_ID, data: dataWithPreparationRecipe(RECIPE_ID) },
    })
  );
});

test('beforeUpdate rejects a { documentId } object self-reference', async () => {
  await assert.rejects(() =>
    lifecycles.beforeUpdate({
      params: { documentId: RECIPE_ID, data: dataWithPreparationRecipe({ documentId: RECIPE_ID }) },
    })
  );
});

test('beforeUpdate rejects a { set: [...] } self-reference', async () => {
  await assert.rejects(() =>
    lifecycles.beforeUpdate({
      params: {
        documentId: RECIPE_ID,
        data: dataWithPreparationRecipe({ set: [{ documentId: RECIPE_ID }] }),
      },
    })
  );
});

test('beforeUpdate rejects a { connect: [...] } self-reference', async () => {
  await assert.rejects(() =>
    lifecycles.beforeUpdate({
      params: {
        documentId: RECIPE_ID,
        data: dataWithPreparationRecipe({ connect: [{ documentId: RECIPE_ID }] }),
      },
    })
  );
});

test('beforeUpdate allows a preparationRecipe pointing at a different recipe', async () => {
  await assert.doesNotReject(() =>
    lifecycles.beforeUpdate({
      params: { documentId: RECIPE_ID, data: dataWithPreparationRecipe(OTHER_ID) },
    })
  );
});

test('beforeUpdate allows a null preparationRecipe (unset)', async () => {
  await assert.doesNotReject(() =>
    lifecycles.beforeUpdate({
      params: { documentId: RECIPE_ID, data: dataWithPreparationRecipe(null) },
    })
  );
});

test('beforeUpdate is a no-op when data has no ingredientSections (partial/unrelated update)', async () => {
  await assert.doesNotReject(() =>
    lifecycles.beforeUpdate({ params: { documentId: RECIPE_ID, data: { title: 'שם חדש' } } })
  );
});

test('beforeUpdate is a no-op when there is no documentId (e.g. called outside an update context)', async () => {
  await assert.doesNotReject(() =>
    lifecycles.beforeUpdate({ params: { data: dataWithPreparationRecipe(RECIPE_ID) } })
  );
});
