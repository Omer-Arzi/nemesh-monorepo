export const ShirChallengeMonthCardText = {
  // Short, in-photo label for the current-month-unmatched placeholder's image zone.
  comingSoonImageCaption: "בקרוב",
  // Caption-slot fallback for the same placeholder state when the month is
  // active but has no progress status set.
  comingSoonBodyCaption: "המתכון בדרך",
  // Caption for a matched recipe with no photo — same "no image" meaning as
  // RecipeCard's fallback, distinct from the "recipe doesn't exist yet" case above.
  noImageCaption: "אין תמונה",
  /** Placeholder card's accessible name — visible text alone doesn't read as a link. */
  placeholderAriaLabel: (monthLabel: string, statusText: string) =>
    `האתגר של שיר – ${monthLabel} – ${statusText}, מעבר לעמוד האתגר`,
} as const;
