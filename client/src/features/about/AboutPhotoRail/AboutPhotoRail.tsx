import Box from "@mui/material/Box";
import { FreckleDust, NemeshImage } from "@/components/shared";
import type { Image } from "@/types/domain";
import { AboutPhotoRailStyle } from "./AboutPhotoRail.style";

type Props = {
  primaryImage: Image;
  secondaryImage: Image;
};

type PhotoSlot = {
  image: Image;
  rotate: string;
  mt: { xs: number; md: number };
};

/**
 * Two Strapi-managed photos styled as though clipped to a stylized, minimal
 * kitchen order rail — decorative, not a literal illustration. Rail line and
 * clips are hidden from assistive technology; only the photos carry alt text
 * (Strapi media alternativeText, via the Image domain type).
 *
 * Each clip is positioned relative to its own photo (not the shared rail
 * strip) and moves with it — so a photo hung lower than the other still
 * reads as clipped to the rail rather than floating below its clip.
 *
 * Both images are guaranteed present by the time this renders — AboutPage's
 * mapper (aboutPageService.ts) treats a missing image as the whole entry
 * being unusable, so there is no partial/one-missing-image state to handle
 * here (see that file's doc comment for why).
 */
export default function AboutPhotoRail({ primaryImage, secondaryImage }: Props) {
  const photos: PhotoSlot[] = [
    { image: primaryImage, rotate: "-0.5deg", mt: { xs: 0, md: 0 } },
    { image: secondaryImage, rotate: "5deg", mt: { xs: 0.5, md: 0.5 } },
  ];

  return (
    <Box sx={AboutPhotoRailStyle.root}>
      <FreckleDust placement="top-left" density="low" />
      <Box sx={AboutPhotoRailStyle.railTrack} aria-hidden>
        <Box sx={AboutPhotoRailStyle.railLine} />
      </Box>

      <Box sx={AboutPhotoRailStyle.photosRow}>
        {photos.map((photo, i) => (
          <Box
            key={i}
            sx={{ ...AboutPhotoRailStyle.photoWrapper, transform: `rotate(${photo.rotate})`, mt: photo.mt }}
          >
            <Box sx={AboutPhotoRailStyle.clip} aria-hidden />
            <Box sx={AboutPhotoRailStyle.photoFrame}>
              <NemeshImage
                image={photo.image}
                fill
                objectFit="cover"
                alt={photo.image.alt}
                sizes="(max-width: 899px) 45vw, 220px"
              />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
