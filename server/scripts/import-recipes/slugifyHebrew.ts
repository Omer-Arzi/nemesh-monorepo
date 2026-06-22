const HEBREW_TO_LATIN: Record<string, string> = {
  א: "a",  ב: "b",  ג: "g",  ד: "d",  ה: "h",
  ו: "v",  ז: "z",  ח: "ch", ט: "t",  י: "y",
  כ: "k",  ך: "k",  ל: "l",  מ: "m",  ם: "m",
  נ: "n",  ן: "n",  ס: "s",  ע: "a",  פ: "p",
  ף: "f",  צ: "ts", ץ: "ts", ק: "k",  ר: "r",
  ש: "sh", ת: "t",
};

/** Transliterate a Hebrew title into a URL-safe ASCII slug. */
export function slugifyHebrew(title: string): string {
  let result = "";

  for (const char of title) {
    if (HEBREW_TO_LATIN[char]) {
      result += HEBREW_TO_LATIN[char];
    } else if (/[a-zA-Z0-9]/.test(char)) {
      result += char.toLowerCase();
    } else if (/[\s\-_]/.test(char)) {
      result += "-";
    }
    // Drop everything else: punctuation, diacritics (nikud), etc.
  }

  return (
    result
      .replace(/-+/g, "-")   // collapse consecutive hyphens
      .replace(/^-|-$/g, "") // trim leading/trailing hyphens
    || "recipe"               // fallback if title produces no output
  );
}

/**
 * Return `baseSlug`, or `baseSlug-2`, `baseSlug-3`, etc.
 * if `baseSlug` is already in `usedSlugs`.
 * Does NOT mutate `usedSlugs` — the caller is responsible for adding the result.
 */
export function ensureUniqueSlug(baseSlug: string, usedSlugs: Set<string>): string {
  if (!usedSlugs.has(baseSlug)) return baseSlug;
  let counter = 2;
  while (usedSlugs.has(`${baseSlug}-${counter}`)) counter++;
  return `${baseSlug}-${counter}`;
}
