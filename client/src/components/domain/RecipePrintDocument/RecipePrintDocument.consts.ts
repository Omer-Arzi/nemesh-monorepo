/**
 * Static copy for the recipe print document.
 *
 * Section titles mirror the on-screen components (tips / equipment strings are
 * literals in `RecipeTipsSection` / `RecipeSpecialEquipmentSection`; the steps
 * title reuses `PreparationStepsSectionText.sectionTitle`, and the metadata
 * labels reuse `RecipeHeroText`).
 */
export const RecipePrintDocumentText = {
  tipsTitle: "הערות מהמטבח",
  equipmentTitle: "כלים מיוחדים",
  ingredientsTitle: "מצרכים",
  /** Middot run separator for the metadata block and the equipment list. */
  separator: " · ",
  /** Em-dash separator between an ingredient name and its note. */
  noteSeparator: " – ",
  logoAlt: "Nemesh",
} as const;
