/**
 * Footer lifecycle hooks.
 *
 * Validates that each footer link has exactly one of `page` or `externalUrl`.
 * This constraint cannot be expressed in the JSON schema alone.
 */

function validateFooterData(data: unknown): void {
  const d = data as Record<string, unknown> | null | undefined;
  const sections = d?.sections;
  if (!Array.isArray(sections)) return;

  for (let si = 0; si < sections.length; si++) {
    const section = sections[si] as Record<string, unknown> | null;
    const links = section?.links;
    if (!Array.isArray(links)) continue;

    for (let li = 0; li < links.length; li++) {
      const link = links[li] as Record<string, unknown> | null;

      const hasPage =
        link?.page != null &&
        link.page !== '' &&
        // Handle both documentId string and connect/disconnect object shapes
        !(typeof link.page === 'object' &&
          Array.isArray((link.page as Record<string, unknown>)?.connect) &&
          ((link.page as Record<string, unknown>).connect as unknown[]).length === 0);

      const hasExternal =
        typeof link?.externalUrl === 'string' && link.externalUrl.trim() !== '';

      if (hasPage && hasExternal) {
        throw new Error(
          `Footer — section ${si + 1}, link ${li + 1}: set either "page" or "externalUrl", not both.`
        );
      }
      if (!hasPage && !hasExternal) {
        throw new Error(
          `Footer — section ${si + 1}, link ${li + 1}: exactly one of "page" or "externalUrl" must be set.`
        );
      }
    }
  }
}

export default {
  async beforeCreate(event: { params: { data: unknown } }) {
    validateFooterData(event.params.data);
  },

  async beforeUpdate(event: { params: { data: unknown } }) {
    validateFooterData(event.params.data);
  },
};
