/**
 * Compute the current month key ("YYYY-MM") in Israel timezone.
 * Both queries (current + previous) compute this client-side so they can
 * run in parallel without a data waterfall.
 */
export function getCurrentMonthKey(): string {
  return new Date()
    .toLocaleDateString("en-CA", {
      timeZone: "Asia/Jerusalem",
      year: "numeric",
      month: "2-digit",
    })
    .slice(0, 7); // "2026-06"
}

/** First day of the current month in Israel timezone, e.g. "2026-06-01". */
export function getCurrentMonthStart(): string {
  return `${getCurrentMonthKey()}-01`;
}

/**
 * Format a monthStart date string ("YYYY-MM-DD") as a Hebrew display label.
 *
 * Same year as today → just month name, e.g. "יוני".
 * Different year → month name + year, e.g. "דצמבר 2025".
 */
export function formatHebrewMonthLabel(monthStart: string): string {
  // Replace dashes so Safari parses the date correctly (avoids Invalid Date).
  const date = new Date(monthStart.replace(/-/g, "/") + " 12:00:00");
  const currentYear = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
  });
  const monthYear = date.toLocaleDateString("en-CA", {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
  });
  const monthName = date.toLocaleDateString("he-IL", {
    timeZone: "Asia/Jerusalem",
    month: "long",
  });
  return monthYear === currentYear ? monthName : `${monthName} ${monthYear}`;
}
