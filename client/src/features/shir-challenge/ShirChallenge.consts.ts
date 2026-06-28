import type { MyProgressStatus, MonthlyChallengeStatus } from "@/types/domain";

export const SHIR_CHALLENGE_SLUG = "shir-challenge";

export const ShirChallengeDefaults = {
  title: "האתגר של שיר",
  badgeText: "האתגר החודשי",
  subtitle:
    "כל חודש שיר מביאה חומר גלם חדש, ואנחנו צריכים להפוך אותו למתכון שאפשר להכין, לצלם ולשתף.",
  recipesSectionTitle: "מתכוני האתגר",
  // Shown when current month has active status but ingredient not yet entered
  ingredientNameFallback: "טרם נבחר",
  // Shown when there is no current month record at all
  pendingNote: "שיר עדיין לא הכריזה על חומר הגלם של החודש.",
  skippedNoteFallback:
    "החודש האתגר לוקח הפסקה קטנה. נחזור עם חומר גלם חדש באתגר הבא.",
} as const;

export const PROGRESS_STATUS_LABELS: Record<MyProgressStatus, string> = {
  idea: "נבחר חומר גלם",
  writing: "בכתיבה",
  cooked: "הוכן",
  published: "עלה לאתר",
};

export const MONTHLY_CHALLENGE_STATUS_LABELS: Record<MonthlyChallengeStatus, string> = {
  pending: "מחכים לחומר הגלם",
  active: "אתגר פעיל",
  skipped: "אין אתגר החודש",
};

export const ShirChallengeText = {
  loading: "טוען את האתגר...",
  errorNotFound: "האתגר לא נמצא",
  recipesLoading: "טוען מתכונים...",
  emptyTitle: "אין מתכונים עדיין",
  emptyDescription: "מתכוני האתגר יופיעו כאן ברגע שיעלו.",
  statusPanelTitle: "סטטוס האתגר החודשי",
  statusPanelLabelIngredient: "חומר הגלם",
  statusPanelLabelMonth: "חודש",
  statusPanelLabelProgress: "סטטוס ההכנה שלי",
  prevSectionTitle: "האתגר הקודם",
} as const;
