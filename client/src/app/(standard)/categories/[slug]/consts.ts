export const CategoryPageText = {
  loading: "טוען קטגוריה...",
  errorNotFound: "הקטגוריה לא נמצאה",
  recipeSectionTitle: "מתכונים",
  emptyTitle: "עוד אין כאן מתכונים",
  emptyDescription: "הקטגוריה הזו מחכה למתכון הראשון שלה.",

  // ── Metadata (generateMetadata in page.tsx) ───────────────────────────────
  /** e.g. "מתכוני עוף" — the root layout's title.template appends " | Nemesh". */
  metaTitle: (categoryName: string) => `מתכוני ${categoryName}`,
  /** Used only when the category has no editorial `description` in Strapi. */
  metaDescriptionFallback: (categoryName: string) =>
    `אוסף מתכוני ${categoryName} מהמטבח של נמש — מתכונים ביתיים וברורים, עם כל השלבים והכמויות.`,
} as const;
