/**
 * Formats a numeric ingredient amount for display.
 *
 * Converts common decimal values into Unicode fraction glyphs and supports
 * mixed numbers. Unknown decimals are passed through as-is so the output
 * always stays readable.
 *
 * Examples (no test runner — annotated here instead):
 *   formatIngredientAmount(null)      → ""
 *   formatIngredientAmount(0)         → "0"
 *   formatIngredientAmount(1)         → "1"
 *   formatIngredientAmount(2)         → "2"
 *   formatIngredientAmount(0.5)       → "½"
 *   formatIngredientAmount(1.5)       → "1½"
 *   formatIngredientAmount(2.25)      → "2¼"
 *   formatIngredientAmount(0.125)     → "⅛"
 *   formatIngredientAmount(0.25)      → "¼"
 *   formatIngredientAmount(0.333)     → "⅓"   (tolerance handles 1/3 ≈ 0.333…)
 *   formatIngredientAmount(0.333333)  → "⅓"
 *   formatIngredientAmount(0.375)     → "⅜"
 *   formatIngredientAmount(0.625)     → "⅝"
 *   formatIngredientAmount(0.666)     → "⅔"
 *   formatIngredientAmount(0.6667)    → "⅔"
 *   formatIngredientAmount(0.75)      → "¾"
 *   formatIngredientAmount(0.875)     → "⅞"
 *   formatIngredientAmount(1.25)      → "1¼"
 *   formatIngredientAmount(1.75)      → "1¾"
 *   formatIngredientAmount(2.333)     → "2⅓"
 *   formatIngredientAmount(2.5)       → "2½"
 *   formatIngredientAmount(3.875)     → "3⅞"
 *   formatIngredientAmount(1.666666)  → "1⅔"
 *   formatIngredientAmount(0.2)       → "0.2"  (unknown — pass through)
 *   formatIngredientAmount(1.2)       → "1.2"  (unknown — pass through)
 */

// Tolerance for matching known fractions.
// Tight enough that 0.34 does not match ⅓, wide enough that 0.333 does.
const TOLERANCE = 0.005;

// Unicode LTR isolate markers — prevent the bidi algorithm from reordering
// digits and fraction glyphs (e.g. rendering "3½" as "½3") when this string
// is embedded inside an RTL paragraph.
const LTR_OPEN = "⁦";
const LTR_CLOSE = "⁩";

// Pairs of [exact decimal value, Unicode glyph], smallest to largest.
const FRACTIONS: ReadonlyArray<readonly [number, string]> = [
  [1 / 8, "⅛"],
  [1 / 6, "⅙"],
  [1 / 4, "¼"],
  [1 / 3, "⅓"],
  [3 / 8, "⅜"],
  [1 / 2, "½"],
  [5 / 8, "⅝"],
  [2 / 3, "⅔"],
  [3 / 4, "¾"],
  [5 / 6, "⅚"],
  [7 / 8, "⅞"],
];

export function formatIngredientAmount(
  amount: number | null | undefined
): string {
  if (amount == null || !Number.isFinite(amount)) return "";

  const whole = Math.floor(amount);
  const fractionalPart = amount - whole;

  // Whole number (or negligible floating-point residue)
  if (fractionalPart < TOLERANCE) {
    return `${LTR_OPEN}${whole}${LTR_CLOSE}`;
  }

  // Try to match the fractional part to a known fraction
  const match = FRACTIONS.find(
    ([decimal]) => Math.abs(decimal - fractionalPart) < TOLERANCE
  );

  if (match) {
    const [, glyph] = match;
    const formatted = whole === 0 ? glyph : `${whole}${glyph}`;
    return `${LTR_OPEN}${formatted}${LTR_CLOSE}`;
  }

  // Unknown decimal — return the original value unchanged
  return `${LTR_OPEN}${amount}${LTR_CLOSE}`;
}
