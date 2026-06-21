import type { Core } from '@strapi/strapi';
import { seedIngredients } from './scripts/seed-ingredients';

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    if (process.env.SEED_DB === 'true') {
      await seedIngredients({ strapi });
    }
  },
};
