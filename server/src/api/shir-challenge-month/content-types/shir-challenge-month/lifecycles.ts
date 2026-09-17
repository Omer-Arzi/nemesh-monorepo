/**
 * Shir Challenge Month lifecycle hooks.
 *
 * `monthKey` (a "YYYY-MM" calendar-month label) is kept as a real, persisted
 * attribute — it's what the carousel sorts/filters on and what the query-cache
 * keys are built from (see shirChallengeMonthService.ts) — but it must never
 * be independently authored: it is always derived from `monthStart` (the
 * record's real identity field, see schema.json) so the two can never drift
 * out of sync, whether the record was created by the cron placeholder job or
 * manually in the admin.
 */

/** Derives "YYYY-MM" from a "YYYY-MM-DD" (or full ISO) monthStart value. */
function deriveMonthKey(monthStart: unknown): string | null {
  if (typeof monthStart !== 'string' || monthStart.length < 7) return null;
  return monthStart.slice(0, 7);
}

function applyDerivedMonthKey(data: unknown): void {
  const d = data as Record<string, unknown> | null | undefined;
  if (!d || typeof d !== 'object') return;
  if (!('monthStart' in d)) return;

  const monthKey = deriveMonthKey(d.monthStart);
  if (monthKey) {
    d.monthKey = monthKey;
  }
}

export default {
  async beforeCreate(event: { params: { data: unknown } }) {
    applyDerivedMonthKey(event.params?.data);
  },

  async beforeUpdate(event: { params: { data: unknown } }) {
    applyDerivedMonthKey(event.params?.data);
  },
};
