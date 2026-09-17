export const ShirChallengeMonthCardText = {
  // Short, in-photo label for the current-month-unmatched placeholder's image zone.
  comingSoonImageCaption: "בקרוב",
  // Fuller caption-slot copy for the same placeholder state, matching the
  // note-copy voice already established in ShirChallengeDefaults.
  comingSoonBodyCaption: "המתכון בדרך",
  // Caption for a matched recipe with no photo — same "no image" meaning as
  // RecipeCard's fallback, distinct from the "recipe doesn't exist yet" case above.
  noImageCaption: "אין תמונה",
  /** Placeholder card's accessible name — visible text alone doesn't read as a link. */
  placeholderAriaLabel: (monthLabel: string) =>
    `האתגר של שיר – ${monthLabel} – המתכון בדרך, מעבר לעמוד האתגר`,
} as const;
