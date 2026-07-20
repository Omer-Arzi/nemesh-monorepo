import type { ComponentType, SVGProps } from "react";
import {
  IngredientsAvailableIllustration,
  CookingModeIllustration,
  SearchByIngredientsIllustration,
} from "@/assets/illustrations";
import { FEATURE_CARD_KEYS } from "@/constants";

/**
 * Maps a feature card's Strapi `cardKey` to its hand-authored illustration.
 * These three keys are the ones the content editor is expected to use when
 * filling in the three known cards — see docs/architecture.md §14. A card
 * whose key isn't one of these three falls back to its Strapi-managed
 * `icon` media field instead (FeatureSection.tsx), so adding a future
 * fourth card doesn't require a code change to stay renderable.
 */
export const FEATURE_CARD_ILLUSTRATIONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  [FEATURE_CARD_KEYS.INGREDIENTS_AVAILABLE]: IngredientsAvailableIllustration,
  [FEATURE_CARD_KEYS.COOKING_MODE]: CookingModeIllustration,
  [FEATURE_CARD_KEYS.SEARCH_BY_INGREDIENTS]: SearchByIngredientsIllustration,
};
