import mammoth from "mammoth";

/**
 * Extract plain text from a DOCX file.
 * mammoth preserves paragraph structure; each paragraph becomes a line.
 */
export async function parseDocx(filePath: string): Promise<string> {
  const result = await mammoth.extractRawText({ path: filePath });

  if (result.messages.length > 0) {
    const warnings = result.messages.filter((m) => m.type === "warning");
    if (warnings.length > 0) {
      console.warn("[parseDocx] Warnings from mammoth:");
      warnings.forEach((m) => console.warn(" ", m.message));
    }
  }

  const text = result.value.trim();
  if (!text) throw new Error("DOCX produced no text. Is the file empty or image-only?");

  return text;
}
