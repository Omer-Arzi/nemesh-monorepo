// TEMP DEBUG — layout bug investigation. Delete this file before merging.
"use client";

/** Snapshot of every <style data-emotion> tag currently in the document. */
export function snapshotEmotionStyles() {
  if (typeof document === "undefined") return null;
  const tags = Array.from(
    document.querySelectorAll<HTMLStyleElement>("style[data-emotion]")
  );
  const totalLength = tags.reduce((sum, t) => sum + (t.textContent?.length ?? 0), 0);
  // data-emotion="muirtl <hash1> <hash2> ..." — the class hashes this tag covers.
  const classNames = tags.flatMap((t) =>
    (t.getAttribute("data-emotion") ?? "").split(/\s+/).slice(1)
  );
  return { tagCount: tags.length, totalLength, classCount: classNames.length, classNames };
}

/**
 * Checks whether every css-* class actually applied to `el` has matching CSS
 * text in some <style data-emotion> tag. A non-empty return means a class is
 * present on the DOM node but visually inert — proof of a missing/stale
 * style insertion rather than a wrong prop/state value.
 */
export function classesMissingCss(el: HTMLElement): string[] {
  if (typeof document === "undefined") return [];
  const tags = Array.from(document.querySelectorAll<HTMLStyleElement>("style[data-emotion]"));
  const allCss = tags.map((t) => t.textContent ?? "").join("\n");
  const classList = el.className.split(/\s+/).filter(Boolean);
  return classList.filter((c) => c.startsWith("css-") && !allCss.includes(`.${c}`));
}
