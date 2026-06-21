import type { Difficulty } from "@/types/domain";

/**
 * Display labels for domain enum values.
 *
 * Centralised here so every component that renders a Difficulty, status,
 * or other enum value reads from the same source of truth.
 *
 * When a full i18n library is introduced, replace the string literals with
 * translation-key lookups and remove this file.
 */

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: "קל",
  medium: "בינוני",
  hard: "מאתגר",
};
