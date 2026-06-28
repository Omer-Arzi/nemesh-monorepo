import NextImage from "next/image";
import type { Image } from "@/types/domain";
import { getImageUrl } from "@/lib/image/imageService";

export type NemeshImageProps = {
  /** Domain Image object — src and alt are derived automatically when provided. */
  image?: Image | null;
  /** Explicit src override. Takes precedence over image.url when provided. */
  src?: string;
  /** Alt text override. Defaults to image.alt when image is provided. */
  alt?: string;
  /** Fill the parent container (parent must be position: relative with explicit dimensions). */
  fill?: boolean;
  /** Intrinsic width in pixels. Defaults to image.width when image is provided. */
  width?: number;
  /** Intrinsic height in pixels. Defaults to image.height when image is provided. */
  height?: number;
  /** Responsive sizes hint passed to the browser (same as Next.js Image sizes prop). */
  sizes?: string;
  /** Mark as high-priority — disables lazy loading and preloads the image. */
  priority?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Project-standard image component. Wraps Next.js Image to provide:
 * - Automatic URL and alt resolution from the domain Image type
 * - A single integration point for future enhancements (blur placeholder, CDN migration, etc.)
 *
 * Usage — fill mode (parent must be position:relative):
 *   <NemeshImage image={recipe.image} fill sizes="..." style={{ objectFit: "cover" }} />
 *
 * Usage — responsive with natural dimensions:
 *   <NemeshImage image={step.image} style={{ width: "100%", height: "auto" }} sizes="..." />
 */
export default function NemeshImage({
  image,
  src: srcProp,
  alt: altProp,
  fill,
  width: widthProp,
  height: heightProp,
  sizes,
  priority,
  className,
  style,
}: NemeshImageProps) {
  const src = srcProp ?? getImageUrl(image);
  const alt = altProp ?? image?.alt ?? "";

  if (!src) return null;

  if (fill) {
    return (
      <NextImage
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={className}
        style={style}
      />
    );
  }

  const width = widthProp ?? image?.width;
  const height = heightProp ?? image?.height;

  if (width && height) {
    return (
      <NextImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        className={className}
        style={style}
      />
    );
  }

  // Graceful fallback when intrinsic dimensions are unavailable and fill is not set.
  // Bypasses Next.js image optimization but prevents a layout crash.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} style={style} />;
}
