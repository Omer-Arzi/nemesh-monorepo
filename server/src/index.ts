import type { Core } from '@strapi/strapi';
import { seedIngredients } from './scripts/seed-ingredients';

const MONTH_UID = 'api::shir-challenge-month.shir-challenge-month' as const;

/** Returns the current month key in Israel timezone, e.g. "2026-06". */
function israelMonthKey(): string {
  return new Date()
    .toLocaleDateString('en-CA', {
      timeZone: 'Asia/Jerusalem',
      year: 'numeric',
      month: '2-digit',
    })
    .slice(0, 7);
}

/**
 * Creates a pending shir-challenge-month record for the current month if one
 * does not already exist. Safe to call on every bootstrap or cron tick.
 */
async function ensureCurrentChallengeMonth(strapi: Core.Strapi) {
  const monthKey = israelMonthKey();
  const monthStart = `${monthKey}-01`;

  const existing = await strapi.documents(MONTH_UID).findFirst({
    filters: { monthKey: { $eq: monthKey } },
  });

  if (!existing) {
    await strapi.documents(MONTH_UID).create({
      data: {
        monthKey,
        monthStart,
        monthlyChallengeStatus: 'pending',
        monthlyChallengeNote: 'מחכים לחומר הגלם של שיר.',
      },
    });
    strapi.log.info(`[shir-challenge] Created month record for ${monthKey}`);
  }
}

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    // Run daily at midnight UTC (≈ 2–3 am Israel time).
    // Idempotent: skips creation if the record already exists.
    strapi.cron.add({
      ensureCurrentChallengeMonth: {
        task: ({ strapi }: { strapi: Core.Strapi }) => ensureCurrentChallengeMonth(strapi),
        options: { rule: '0 0 * * *' },
      },
    });
  },

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    if (process.env.SEED_DB === 'true') {
      await seedIngredients({ strapi });
    }

    // Also ensure current month on every server start (catches missed cron ticks).
    await ensureCurrentChallengeMonth(strapi);
  },
};
