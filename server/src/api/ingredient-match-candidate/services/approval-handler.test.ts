import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleVariantApproval } from './approval-handler';

type FakeIngredient = {
  documentId: string;
  canonicalName: string;
  variants: unknown;
};

function createFakeStrapi(ingredient: FakeIngredient | null) {
  let current = ingredient;
  const updateCalls: Array<{ documentId: string; data: any }> = [];

  const strapi = {
    log: { info: () => {}, warn: () => {}, error: () => {} },
    documents: (_uid: string) => ({
      findOne: async ({ documentId }: { documentId: string }) =>
        current && current.documentId === documentId ? { ...current } : null,
      update: async ({ documentId, data }: { documentId: string; data: any }) => {
        updateCalls.push({ documentId, data });
        current = { ...(current as FakeIngredient), ...data };
        return { ...current };
      },
    }),
  } as any;

  return { strapi, updateCalls, getIngredient: () => current };
}

const SELECTED = { documentId: 'ingredient-1' };

test('variants === null: appends the approved value', async () => {
  const { strapi, updateCalls, getIngredient } = createFakeStrapi({
    documentId: 'ingredient-1',
    canonicalName: 'בצל סגול',
    variants: null,
  });

  await handleVariantApproval(strapi, 'בצלים סגולים', SELECTED);

  assert.equal(updateCalls.length, 1);
  assert.deepEqual(getIngredient()?.variants, ['בצלים סגולים']);
});

test('variants === undefined (missing field): appends the approved value', async () => {
  const { strapi, updateCalls, getIngredient } = createFakeStrapi({
    documentId: 'ingredient-1',
    canonicalName: 'בצל סגול',
    variants: undefined,
  });

  await handleVariantApproval(strapi, 'בצלים סגולים', SELECTED);

  assert.equal(updateCalls.length, 1);
  assert.deepEqual(getIngredient()?.variants, ['בצלים סגולים']);
});

test('variants is an empty array: appends the approved value', async () => {
  const { strapi, updateCalls, getIngredient } = createFakeStrapi({
    documentId: 'ingredient-1',
    canonicalName: 'בצל סגול',
    variants: [],
  });

  await handleVariantApproval(strapi, 'בצלים סגולים', SELECTED);

  assert.equal(updateCalls.length, 1);
  assert.deepEqual(getIngredient()?.variants, ['בצלים סגולים']);
});

test('variants already contains values: preserves existing entries and appends the new one', async () => {
  const { strapi, updateCalls, getIngredient } = createFakeStrapi({
    documentId: 'ingredient-1',
    canonicalName: 'בצל סגול',
    variants: ['בצל אדום'],
  });

  await handleVariantApproval(strapi, 'בצלים סגולים', SELECTED);

  assert.equal(updateCalls.length, 1);
  assert.deepEqual(getIngredient()?.variants, ['בצל אדום', 'בצלים סגולים']);
});

test('exact duplicate value is not appended twice', async () => {
  const { strapi, updateCalls, getIngredient } = createFakeStrapi({
    documentId: 'ingredient-1',
    canonicalName: 'בצל סגול',
    variants: ['בצלים סגולים'],
  });

  await handleVariantApproval(strapi, 'בצלים סגולים', SELECTED);

  assert.equal(updateCalls.length, 0, 'no update should be issued for an exact duplicate');
  assert.deepEqual(getIngredient()?.variants, ['בצלים סגולים']);
});

test('empty string is not appended', async () => {
  const { strapi, updateCalls, getIngredient } = createFakeStrapi({
    documentId: 'ingredient-1',
    canonicalName: 'בצל סגול',
    variants: ['בצל אדום'],
  });

  await handleVariantApproval(strapi, '', SELECTED);

  assert.equal(updateCalls.length, 0);
  assert.deepEqual(getIngredient()?.variants, ['בצל אדום']);
});

test('whitespace-only string is not appended', async () => {
  const { strapi, updateCalls, getIngredient } = createFakeStrapi({
    documentId: 'ingredient-1',
    canonicalName: 'בצל סגול',
    variants: ['בצל אדום'],
  });

  await handleVariantApproval(strapi, '   ', SELECTED);

  assert.equal(updateCalls.length, 0);
  assert.deepEqual(getIngredient()?.variants, ['בצל אדום']);
});

test('surrounding whitespace on a valid value is trimmed before storing/comparing', async () => {
  const { strapi, updateCalls, getIngredient } = createFakeStrapi({
    documentId: 'ingredient-1',
    canonicalName: 'בצל סגול',
    variants: [],
  });

  await handleVariantApproval(strapi, '  בצלים סגולים  ', SELECTED);

  assert.equal(updateCalls.length, 1);
  assert.deepEqual(getIngredient()?.variants, ['בצלים סגולים']);
});

test('selectedIngredient not found: no-ops without throwing', async () => {
  const { strapi, updateCalls } = createFakeStrapi(null);

  await assert.doesNotReject(() => handleVariantApproval(strapi, 'בצלים סגולים', SELECTED));

  assert.equal(updateCalls.length, 0);
});
