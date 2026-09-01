import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeText } from '../../ingredient-match-candidate/services/normalizer';
import {
  INGREDIENT_TIER,
  classifyIngredientMatch,
  buildIngredientSuggestions,
  dedupeIngredientSuggestions,
  type IngredientCatalogRow,
  type IngredientSuggestion,
} from './suggestion-ranking';

const ONION_ROW: IngredientCatalogRow = {
  document_id: 'ingredient-onion',
  canonical_name: 'בצל',
  slug: 'onion',
  variants: ['בצל', 'שאלוט', 'בצלים פרוסים'],
  cn_score: 0,
};

test('classifyIngredientMatch: exact variant match wins over prefix/contains on the same row', () => {
  const nq = normalizeText('שאלוט');
  const result = classifyIngredientMatch(ONION_ROW, nq);
  assert.deepEqual(result, { kind: 'variant-exact', matchedText: 'שאלוט' });
});

test('classifyIngredientMatch: exact canonical match takes priority over variant-exact', () => {
  const nq = normalizeText('בצל');
  // 'בצל' is both the canonical_name and (coincidentally) listed as a variant —
  // canonical-exact must win the tie.
  const result = classifyIngredientMatch(ONION_ROW, nq);
  assert.equal(result.kind, 'canonical-exact');
});

test('classifyIngredientMatch: prefix match on a variant', () => {
  const nq = normalizeText('שאל');
  const result = classifyIngredientMatch(ONION_ROW, nq);
  assert.deepEqual(result, { kind: 'prefix', matchedText: 'שאלוט' });
});

test('classifyIngredientMatch: contains match on a variant', () => {
  const row: IngredientCatalogRow = { ...ONION_ROW, variants: ['ירוק שאלוט קצוץ'] };
  const nq = normalizeText('שאלוט');
  const result = classifyIngredientMatch(row, nq);
  assert.deepEqual(result, { kind: 'contains', matchedText: 'ירוק שאלוט קצוץ' });
});

test('classifyIngredientMatch: falls back to fuzzy when nothing else matches', () => {
  const row: IngredientCatalogRow = { ...ONION_ROW, variants: [] };
  const nq = normalizeText('קצת אחר');
  const result = classifyIngredientMatch(row, nq);
  assert.equal(result.kind, 'fuzzy');
});

test('buildIngredientSuggestions: exact variant produces the variant first, canonical parent second', () => {
  const nq = normalizeText('שאלוט');
  const [first, second] = buildIngredientSuggestions(ONION_ROW, nq);

  assert.equal(first.matchType, 'variant');
  assert.equal(first.label, 'שאלוט');
  assert.equal(first.subtitle, 'מתכונים עם שאלוט');
  assert.equal(first.searchTerm, 'שאלוט');
  assert.equal(first.score, INGREDIENT_TIER.VARIANT_EXACT);

  assert.equal(second.matchType, 'canonical-parent');
  assert.equal(second.label, 'בצל');
  assert.equal(second.subtitle, 'חיפוש רחב יותר: מתכונים עם בצל');
  assert.equal(second.searchTerm, 'בצל');
  assert.equal(second.score, INGREDIENT_TIER.CANONICAL_PARENT);

  // Explicit ordering guarantee independent of any later sort — this is the
  // exact scenario from the bug report: "שאלוט" must appear before "בצל".
  assert.ok(first.score > second.score);
});

test('buildIngredientSuggestions: exact canonical query produces a single canonical entry', () => {
  const nq = normalizeText('בצל');
  const entries = buildIngredientSuggestions(ONION_ROW, nq);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].matchType, 'canonical');
  assert.equal(entries[0].score, INGREDIENT_TIER.CANONICAL_EXACT);
});

test('overall tier ordering matches the required priority: variant-exact > canonical-exact > canonical-parent > partial', () => {
  const variantEntries = buildIngredientSuggestions(ONION_ROW, normalizeText('שאלוט'));
  const canonicalEntries = buildIngredientSuggestions(ONION_ROW, normalizeText('בצל'));
  const partialEntries = buildIngredientSuggestions(ONION_ROW, normalizeText('שאל'));

  const variantExact = variantEntries.find((e) => e.matchType === 'variant')!;
  const canonicalParent = variantEntries.find((e) => e.matchType === 'canonical-parent')!;
  const canonicalExact = canonicalEntries[0];
  const partial = partialEntries[0];

  assert.ok(variantExact.score > canonicalExact.score);
  assert.ok(canonicalExact.score > canonicalParent.score);
  assert.ok(canonicalParent.score > partial.score);
});

test('dedupeIngredientSuggestions drops repeated (canonicalId, matchType) pairs, keeping the first', () => {
  const a: IngredientSuggestion = {
    type: 'ingredient',
    matchType: 'canonical',
    label: 'בצל',
    subtitle: 'מתכונים עם בצל',
    searchTerm: 'בצל',
    canonicalId: 'ingredient-onion',
    canonicalName: 'בצל',
    score: 90,
  };
  const dupe: IngredientSuggestion = { ...a, score: 1 };
  const other: IngredientSuggestion = { ...a, matchType: 'partial', score: 40 };

  const result = dedupeIngredientSuggestions([a, dupe, other]);
  assert.equal(result.length, 2);
  assert.equal(result[0], a);
  assert.equal(result[1], other);
});
