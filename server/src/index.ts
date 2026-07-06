import type { Core } from '@strapi/strapi';
import { seedIngredients } from './scripts/seed-ingredients';

const MONTH_UID = 'api::shir-challenge-month.shir-challenge-month' as const;
const PAGE_UID = 'api::content-page.content-page' as const;

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

/**
 * Ensures the Public role has find/findOne on content-page.
 * Idempotent — safe to call on every start.
 */
async function ensureContentPagePublicPermissions(strapi: Core.Strapi) {
  const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
    where: { type: 'public' },
    populate: { permissions: true },
  });

  if (!publicRole) return;

  const required = [
    'api::content-page.content-page.find',
    'api::content-page.content-page.findOne',
  ];

  const existing = new Set(
    ((publicRole as { permissions?: Array<{ action: string }> }).permissions ?? []).map(
      (p) => p.action
    )
  );

  for (const action of required) {
    if (!existing.has(action)) {
      await strapi.db.query('plugin::users-permissions.permission').create({
        data: { action, role: publicRole.id },
      });
      strapi.log.info(`[permissions] Granted public: ${action}`);
    }
  }
}

/**
 * In development only: creates a placeholder privacy-policy content page if
 * none exists, so the footer footer query can be verified without manual admin steps.
 * The placeholder content should be replaced via Strapi admin with the real text.
 */
async function ensureDevPrivacyPolicyPage(strapi: Core.Strapi) {
  if (process.env.NODE_ENV !== 'development') return;

  const existing = await strapi.documents(PAGE_UID).findFirst({
    filters: { slug: { $eq: 'privacy-policy' } },
  });

  if (existing) {
    strapi.log.info('[content-pages] privacy-policy page already exists — skipping seed');
    return;
  }

  const created = await strapi.documents(PAGE_UID).create({
    data: {
      title: 'מדיניות פרטיות',
      slug: 'privacy-policy',
      summary: 'מדיניות הפרטיות של נמש',
      content: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              text: 'עמוד זה הוא placeholder. יש להחליף את התוכן בטקסט מדיניות הפרטיות האמיתי דרך ממשק ניהול Strapi.',
            },
          ],
        },
      ],
      showInFooter: true,
      footerSection: 'מידע משפטי',
      footerOrder: 1,
    },
  });

  await strapi.documents(PAGE_UID).publish({ documentId: created.documentId });
  strapi.log.info('[content-pages] Created and published privacy-policy placeholder');
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

    await ensureCurrentChallengeMonth(strapi);
    await ensureContentPagePublicPermissions(strapi);
    await ensureDevPrivacyPolicyPage(strapi);
  },
};
