export { slugifyHebrew } from "../../src/utils/slugifyHebrew";

export function ensureUniqueSlug(baseSlug: string, usedSlugs: Set<string>): string {
  if (!usedSlugs.has(baseSlug)) return baseSlug;
  let counter = 2;
  while (usedSlugs.has(`${baseSlug}-${counter}`)) counter++;
  return `${baseSlug}-${counter}`;
}
