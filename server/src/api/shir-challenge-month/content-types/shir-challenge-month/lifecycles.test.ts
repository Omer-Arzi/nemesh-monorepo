import { test } from 'node:test';
import assert from 'node:assert/strict';
import lifecycles from './lifecycles';

test('beforeCreate derives monthKey from monthStart, overriding a submitted value', async () => {
  const data: Record<string, unknown> = {
    monthStart: '2026-08-15',
    monthKey: 'wrong-value',
    monthlyChallengeStatus: 'pending',
  };

  await lifecycles.beforeCreate({ params: { data } });

  assert.equal(data.monthKey, '2026-08');
});

test('beforeCreate derives monthKey when none was submitted at all', async () => {
  const data: Record<string, unknown> = { monthStart: '2026-09-01' };

  await lifecycles.beforeCreate({ params: { data } });

  assert.equal(data.monthKey, '2026-09');
});

test('beforeUpdate re-derives monthKey when monthStart is part of the update', async () => {
  const data: Record<string, unknown> = {
    monthStart: '2026-09-20',
    monthKey: '2026-08',
  };

  await lifecycles.beforeUpdate({ params: { data } });

  assert.equal(data.monthKey, '2026-09');
});

test('beforeUpdate is a no-op when monthStart is not part of the update (e.g. status-only edit)', async () => {
  const data: Record<string, unknown> = { monthlyChallengeStatus: 'active' };

  await lifecycles.beforeUpdate({ params: { data } });

  assert.equal('monthKey' in data, false);
});

test('beforeCreate is a no-op when data is missing entirely', async () => {
  await assert.doesNotReject(() => lifecycles.beforeCreate({ params: { data: undefined } }));
});

test('beforeCreate ignores a non-string monthStart rather than writing a bad monthKey', async () => {
  const data: Record<string, unknown> = { monthStart: null, monthKey: 'kept-as-is' };

  await lifecycles.beforeCreate({ params: { data } });

  assert.equal(data.monthKey, 'kept-as-is');
});
