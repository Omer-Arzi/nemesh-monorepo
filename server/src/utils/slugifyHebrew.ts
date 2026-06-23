const HEBREW_TO_LATIN: Record<string, string> = {
  א: 'a',  ב: 'b',  ג: 'g',  ד: 'd',  ה: 'h',
  ו: 'v',  ז: 'z',  ח: 'ch', ט: 't',  י: 'y',
  כ: 'k',  ך: 'k',  ל: 'l',  מ: 'm',  ם: 'm',
  נ: 'n',  ן: 'n',  ס: 's',  ע: 'a',  פ: 'p',
  ף: 'f',  צ: 'ts', ץ: 'ts', ק: 'k',  ר: 'r',
  ש: 'sh', ת: 't',
};

/** Transliterate a Hebrew string into a URL-safe ASCII slug. */
export function slugifyHebrew(text: string, fallback = 'item'): string {
  let result = '';
  for (const char of text) {
    if (HEBREW_TO_LATIN[char]) {
      result += HEBREW_TO_LATIN[char];
    } else if (/[a-zA-Z0-9]/.test(char)) {
      result += char.toLowerCase();
    } else if (/[\s\-_]/.test(char)) {
      result += '-';
    }
  }
  return result.replace(/-+/g, '-').replace(/^-|-$/g, '') || fallback;
}
