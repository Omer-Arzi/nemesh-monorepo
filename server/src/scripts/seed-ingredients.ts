import type { Core } from '@strapi/strapi';
import { ingredients } from './ingredients-data';

const UID = 'api::ingredient-catalog-item.ingredient-catalog-item' as const;

export async function seedIngredients({ strapi }: { strapi: Core.Strapi }) {
  let created = 0;
  let skipped = 0;

  for (const item of ingredients) {
    const existing = await strapi.documents(UID).findFirst({
      filters: { slug: item.slug },
    });

    if (existing) {
      console.log(`[seed] Skipped: ${item.slug} (${item.canonicalName})`);
      skipped++;
      continue;
    }

    await strapi.documents(UID).create({ data: item });
    console.log(`[seed] Created: ${item.slug} (${item.canonicalName})`);
    created++;
  }

  console.log(`[seed] Done — ${created} created, ${skipped} skipped`);
}
