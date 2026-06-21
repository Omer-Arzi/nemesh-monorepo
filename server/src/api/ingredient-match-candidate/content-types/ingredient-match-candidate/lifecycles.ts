import type { Core } from '@strapi/strapi';
import { handleCandidateApproval } from '../../services/approval-handler';

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
   * If reviewStatus just transitioned to 'approved' and selectedIngredient is set,
   * add normalizedText to that ingredient's variants.
   */
  async afterUpdate(event: { result: any; state: any }) {
    const { result, state } = event;

    const justApproved =
      state.previousReviewStatus !== 'approved' &&
      result.reviewStatus === 'approved';

    if (!justApproved) return;

    // Re-fetch with both ingredient relations populated — relations are not
    // populated on the lifecycle result by default.
    const candidate = await strapi.documents(UID).findOne({
      documentId: result.documentId,
      populate: ['selectedIngredient', 'suggestedIngredient'],
    });

    const resolvedIngredient =
      (candidate?.selectedIngredient as { documentId: string } | null) ??
      (candidate?.suggestedIngredient as { documentId: string } | null);

    if (!resolvedIngredient) {
      strapi.log.warn(
        `[candidate-lifecycle] Candidate ${result.documentId} approved without selectedIngredient or suggestedIngredient — variant update skipped`
      );
      return;
    }

    await handleCandidateApproval(strapi, {
      normalizedText: candidate!.normalizedText,
      selectedIngredient: resolvedIngredient,
    });
  },
};
