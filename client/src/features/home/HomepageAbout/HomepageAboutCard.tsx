import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { NemeshImage } from "@/components/shared";
import type { Image, BlockNode } from "@/types/domain";
import AboutReadMoreLink from "./AboutReadMoreLink";
import { HomepageAboutStyle } from "./HomepageAbout.style";

// Maximum characters of raw text shown in the homepage preview.
// Paragraph boundaries are preserved up to this limit; the last visible
// paragraph is word-truncated when the total would exceed it.
const ABOUT_PREVIEW_MAX_CHARS = 420;

// Returns the plain text of a single block-level node, or null when the
// block produces no displayable text (image blocks, empty spacers).
function paragraphToText(block: BlockNode): string | null {
  switch (block.type) {
    case "paragraph":
    case "heading":
    case "quote":
      return block.children
        .map((child) =>
          child.type === "text"
            ? child.text
            : child.children.map((t) => t.text).join(""),
        )
        .join("");
    case "list":
      return block.children
        .map((item) =>
          item.children
            .map((child) =>
              child.type === "text"
                ? child.text
                : child.children.map((t) => t.text).join(""),
            )
            .join(""),
        )
        .join(" ");
    case "code":
      return block.children.map((c) => c.text).join("");
    default:
      return null;
  }
}

// Converts the block tree into an array of paragraph strings that fit within
// maxChars. Each block becomes one paragraph string, preserving the boundaries
// that exist in the admin content. The last paragraph is word-truncated when
// the running total would exceed the limit.
function toPreviewParagraphs(
  blocks: BlockNode[],
  maxChars: number,
): { paragraphs: string[]; truncated: boolean } {
  const result: string[] = [];
  let remaining = maxChars;

  for (const block of blocks) {
    if (remaining <= 0) break;
    const text = paragraphToText(block);
    if (!text || text.trim() === "") continue;

    if (text.length <= remaining) {
      result.push(text);
      remaining -= text.length;
    } else {
      const sliced = text.slice(0, remaining);
      const lastSpace = sliced.lastIndexOf(" ");
      const cut = lastSpace > 0 ? sliced.slice(0, lastSpace) : sliced;
      result.push(cut.trimEnd());
      return { paragraphs: result, truncated: true };
    }
  }

  return { paragraphs: result, truncated: false };
}

type Props = { title: string | null; body: BlockNode[]; image: Image };

// No "use client" — this component has no hooks and all props are serializable.
// NemeshImage is itself a client component; it is used here as a JSX child,
// which is allowed from a server component without crossing the RSC boundary.
export default function HomepageAboutCard({ title, body, image }: Props) {
  const { paragraphs, truncated } = toPreviewParagraphs(body, ABOUT_PREVIEW_MAX_CHARS);

  return (
    <Box sx={HomepageAboutStyle.card}>
      {title && (
        <Typography variant="h5" component="h2" sx={HomepageAboutStyle.title}>
          {title}
        </Typography>
      )}

      {/*
       * imageAndTextArea — flex row-reverse on desktop (image physically
       * left, text physically right; DOM order is image-first), centering
       * the image vertically against the text column's height. See
       * HomepageAbout.style.ts for why row-reverse specifically.
       */}
      <Box sx={HomepageAboutStyle.imageAndTextArea}>
        <Box sx={HomepageAboutStyle.imageWrapper}>
          <NemeshImage
            image={image}
            fill
            objectFit="cover"
            alt={image.alt || title || ""}
            sizes="(max-width: 899px) 100vw, 220px"
            priority
          />
        </Box>

        <Box sx={HomepageAboutStyle.textColumn}>
          {paragraphs.map((para, i) => (
            <Typography key={i} variant="body1" sx={HomepageAboutStyle.previewParagraph}>
              {para}
              {truncated && i === paragraphs.length - 1 && "…"}
            </Typography>
          ))}

          <AboutReadMoreLink />
        </Box>
      </Box>
    </Box>
  );
}
