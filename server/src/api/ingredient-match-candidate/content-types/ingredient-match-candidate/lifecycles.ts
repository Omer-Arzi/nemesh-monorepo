import type { Core } from '@strapi/strapi';
import { handleCanonicalApproval, handleVariantApproval } from '../../services/approval-handler';

declare const strapi: Core.Strapi;

const UID = 'api::ingredient-match-candidate.ingredient-match-candidate' as const;

export default {
  /**
   * Capture the current reviewStatus before the update so we can detect
   * a transition to 'approved' in afterUpdate.
   */
  async beforeUpdate(event: { params: any; state: any }) {
    const { params, state } = event;

    if (!params.documentId) return;

    const existing = await strapi.documents(UID).findOne({
      documentId: params.documentId,
    });

    state.previousReviewStatus = existing?.reviewStatus ?? null;
  },

  /**
   * On approval, dispatch to the correct handler based on matchType:
   *   canonical → create a new IngredientCatalogItem
   *   variant   → add normalizedText to selectedIngredient.variants
   */
  async afterUpdate(event: { result: any; state: any }) {
    const { result, state } = event;

    strapi.log.info(
      `[candidate-lifecycle] afterUpdate fired — documentId=${result.documentId} reviewStatus=${result.reviewStatus} previousReviewStatus=${state.previousReviewStatus}`
    );

    const justApproved =
      state.previousReviewStatus !== 'approved' &&
      result.reviewStatus === 'approved';

    if (!justApproved) {
      strapi.log.info(`[candidate-lifecycle] Not a fresh approval — skipping`);
      return;
    }

    // Re-fetch with selectedIngredient populated — relations are not
    // populated on the lifecycle result by default.
    const candidate = await strapi.documents(UID).findOne({
      documentId: result.documentId,
      populate: ['selectedIngredient'],
    });

    strapi.log.info(
      `[candidate-lifecycle] Re-fetched candidate — matchType=${candidate?.matchType} normalizedText=${candidate?.normalizedText} selectedIngredient=${JSON.stringify(candidate?.selectedIngredient)}`
    );

    if (!candidate) return;

    if (candidate.matchType === 'canonical') {
      await handleCanonicalApproval(strapi, candidate.ingredientName);
      return;
    }

    if (candidate.matchType === 'variant') {
      const selectedIngredient = candidate.selectedIngredient as { documentId: string } | null;

      if (!selectedIngredient) {
        strapi.log.warn(
          `[candidate-lifecycle] Candidate ${result.documentId} approved as variant without selectedIngredient — skipped`
        );
        return;
      }

      await handleVariantApproval(strapi, candidate.normalizedText, selectedIngredient);
      return;
    }

    strapi.log.info(
      `[candidate-lifecycle] Candidate ${result.documentId} approved with matchType "${candidate.matchType}" — no catalog action taken`
    );
  },
};
