import type { MyProgressStatus } from "@/types/domain";

export const SHIR_CHALLENGE_SLUG = "shir-challenge";

export const ShirChallengeDefaults = {
  title: "האתגר של שיר",
  badgeText: "האתגר החודשי",
  subtitle:
    "כל חודש שיר מביאה חומר גלם חדש, ואנחנו צריכים להפוך אותו למתכון שאפשר להכין, לצלם ולשתף.",
  recipesSectionTitle: "מתכוני האתגר",
  recipesSectionSubtitle: "כל המתכונים שעלו כחלק מהאתגר החודשי.",
  introSectionTitle: "איך האתגר עובד?",
} as const;

export const PROGRESS_STATUS_LABELS: Record<MyProgressStatus, string> = {
  idea: "נבחר חומר גלם",
  writing: "בכתיבה",
  cooked: "הוכן",
  published: "עלה לאתר",
};

export const ShirChallengeText = {
  loading: "טוען את האתגר...",
  errorNotFound: "האתגר לא נמצא",
  recipesLoading: "טוען מתכונים...",
  emptyTitle: "אין מתכונים עדיין",
  emptyDescription: "מתכוני האתגר יופיעו כאן ברגע שיעלו.",
  ingredientCardHeader: "חומר הגלם החודש",
} as const;
