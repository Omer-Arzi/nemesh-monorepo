/**
 * Formats a preparation time (in minutes) into a human-readable Hebrew string.
 *
 * Under 60 minutes:
 *   formatPrepTime(15)  → "15 דקות"
 *   formatPrepTime(45)  → "45 דקות"
 *
 * Exactly one hour:
 *   formatPrepTime(60)  → "שעה"
 *
 * One hour + quarter fraction — natural Hebrew wording:
 *   formatPrepTime(75)  → "שעה ורבע"
 *   formatPrepTime(90)  → "שעה וחצי"
 *   formatPrepTime(105) → "שעה ושלושת רבעי"
 *
 * Two or more hours, exact:
 *   formatPrepTime(120) → "שעתיים"
 *   formatPrepTime(180) → "3 שעות"
 *
 * Two or more hours + quarter fraction — compact numeric format (LTR-isolated):
 *   formatPrepTime(135) → "2¼ שעות"
 *   formatPrepTime(150) → "2½ שעות"
 *   formatPrepTime(165) → "2¾ שעות"
 *   formatPrepTime(195) → "3¼ שעות"
 *   formatPrepTime(210) → "3½ שעות"
 *   formatPrepTime(225) → "3¾ שעות"
 *
 * Other minute remainders — verbose fallback:
 *   formatPrepTime(65)  → "שעה ו-5 דקות"
 *   formatPrepTime(125) → "שעתיים ו-5 דקות"
 *   formatPrepTime(185) → "3 שעות ו-5 דקות"
 */

// Unicode LTR isolate markers — prevent the bidi algorithm from reversing
// "2¼" into "¼2" when the string is embedded inside an RTL paragraph.
// Same technique used in lib/formatters/ingredientAmount.ts.
const LTR_OPEN = "⁦";
const LTR_CLOSE = "⁩";

// Quarter-hour remainders → Unicode fraction glyph
const QUARTER_GLYPHS: Record<number, string> = {
  15: "¼",
  30: "½",
  45: "¾",
};

// Quarter-hour remainders → Hebrew natural-language suffix (used only for 1 hour)
const QUARTER_WORDS: Record<number, string> = {
  15: "ורבע",
  30: "וחצי",
  45: "ושלושת רבעי",
};

export function formatPrepTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} דקות`;
  }

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (remainder === 0) {
    return hours === 1 ? "שעה" : hours === 2 ? "שעתיים" : `${hours} שעות`;
  }

  // One hour + quarter → natural Hebrew wording
  if (hours === 1 && QUARTER_WORDS[remainder]) {
    return `שעה ${QUARTER_WORDS[remainder]}`;
  }

  // Two or more hours + quarter → compact numeric fraction (LTR-isolated)
  if (hours >= 2 && QUARTER_GLYPHS[remainder]) {
    return `${LTR_OPEN}${hours}${QUARTER_GLYPHS[remainder]}${LTR_CLOSE} שעות`;
  }

  // Fallback: verbose minutes
  const hoursPart = hours === 1 ? "שעה" : hours === 2 ? "שעתיים" : `${hours} שעות`;
  return `${hoursPart} ו-${remainder} דקות`;
}
