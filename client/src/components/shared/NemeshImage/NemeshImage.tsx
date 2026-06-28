"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { CSSProperties } from "react";
import NextImage from "next/image";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import type { Image } from "@/types/domain";
import { getImageUrl } from "@/lib/image/imageService";
import { NemeshImageStyle } from "./NemeshImage.style";

export type NemeshImageProps = {
  image?: Image | null;
  src?: string;
  alt?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
  objectFit?: CSSProperties["objectFit"];
  objectPosition?: CSSProperties["objectPosition"];
};

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
  objectFit,
  objectPosition,
}: NemeshImageProps) {
  const src = srcProp ?? getImageUrl(image);
  const alt = altProp ?? image?.alt ?? "";

  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [src]);

  // Cached images resolve before onLoad fires — detect them immediately after mount.
  useEffect(() => {
    if (!src) return;
    const img = wrapperRef.current?.querySelector("img");
    if (img?.complete && img.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [src]);

  const handleLoad = useCallback(() => setLoaded(true), []);
  const handleError = useCallback(() => setError(true), []);

  const imgStyle: CSSProperties = {
    objectFit,
    objectPosition,
    opacity: loaded ? 1 : 0,
    transition: "opacity 0.15s ease",
  };

  // ── Fill mode ──────────────────────────────────────────────────────────────
  if (fill) {
    return (
      <Box
        ref={wrapperRef}
        className={className}
        sx={NemeshImageStyle.wrapperFill}
        style={style}
      >
        {src && !error ? (
          <>
            {!loaded && (
              <Skeleton
                variant="rectangular"
                animation="wave"
                sx={NemeshImageStyle.skeleton}
              />
            )}
            <NextImage
              src={src}
              alt={alt}
              fill
              sizes={sizes}
              priority={priority}
              onLoad={handleLoad}
              onError={handleError}
              style={imgStyle}
            />
          </>
        ) : (
          <Box sx={NemeshImageStyle.fallback} />
        )}
      </Box>
    );
  }

  // ── Dimensions mode ─────────────────────────────────────────────────────────
  const intrinsicWidth = widthProp ?? (image?.width && image.width > 0 ? image.width : undefined);
  const intrinsicHeight =
    heightProp ?? (image?.height && image.height > 0 ? image.height : undefined);
  const hasKnownDimensions = !!intrinsicWidth && !!intrinsicHeight;

  return (
    <Box
      ref={wrapperRef}
      className={className}
      sx={{
        ...NemeshImageStyle.wrapperDimensions,
        ...(hasKnownDimensions
          ? { aspectRatio: `${intrinsicWidth} / ${intrinsicHeight}` }
          : {}),
      }}
      style={style}
    >
      {src && !error ? (
        <>
          {!loaded && (
            <Skeleton
              variant="rectangular"
              animation="wave"
              sx={NemeshImageStyle.skeleton}
            />
          )}
          {hasKnownDimensions ? (
            <NextImage
              src={src}
              alt={alt}
              width={intrinsicWidth}
              height={intrinsicHeight}
              sizes={sizes}
              priority={priority}
              onLoad={handleLoad}
              onError={handleError}
              style={{ ...imgStyle, width: "100%", height: "auto", display: "block" }}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={alt}
              onLoad={handleLoad}
              onError={handleError}
              style={{ ...imgStyle, width: "100%", height: "auto", display: "block" }}
            />
          )}
        </>
      ) : (
        <Box
          sx={
            hasKnownDimensions
              ? NemeshImageStyle.fallback
              : { ...NemeshImageStyle.fallback, position: "static", minHeight: 80 }
          }
        />
      )}
    </Box>
  );
}
