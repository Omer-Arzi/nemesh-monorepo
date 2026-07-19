export const AboutPhotoRailStyle = {
  root: {
    position: "relative" as const,
    width: "100%",
    maxWidth: { xs: 360, md: "none" },
    mx: { xs: "auto", md: 0 },
  },

  // Thin strip holding just the rail line — this is a suggestion of a
  // kitchen order rail, not a literal illustration of one.
  railTrack: {
    position: "relative" as const,
    height: 14,
  },

  railLine: {
    position: "absolute" as const,
    insetInlineStart: "6%",
    insetInlineEnd: "6%",
    top: 6,
    height: 2,
    borderRadius: 2,
    bgcolor: "divider",
    boxShadow: "0 1px 2px rgba(90, 45, 10, 0.10)",
  },

  photosRow: {
    display: "flex",
    alignItems: "flex-start" as const,
    gap: { xs: 1.5, md: 2 },
  },

  // Wraps one clip + one photo as a single rigid unit — mt (per-instance
  // vertical offset) and rotation are applied here, so the clip always
  // travels with its own photo.
  //
  // transformOrigin is deliberately pinned to the clip's own position (top
  // center), not the default 50% 50%. Rotating a ~280px-tall element around
  // its center swings anything far from that center — like the clip, which
  // sits at the very top — sideways by several px. Two different rotation
  // angles (-1.5deg vs 1deg) then swing the clip in visually opposite
  // directions, so one photo can look tightly clipped while the other looks
  // detached even though both have the same numeric overlap. Pivoting from
  // the clip's own position instead keeps the clip essentially stationary
  // under rotation — the photo tilts *from* the clip, which is also the
  // physically correct way to think about something hanging from it.
  photoWrapper: {
    position: "relative" as const,
    flex: "1 1 0",
    minWidth: 0,
    transformOrigin: "top center",
  },

  // Overlaps the top edge of its photo (negative top) so it reads as a
  // clip pinching the photo rather than a mark floating above it. Longer
  // than a literal paper clip so it visibly reaches back up toward the rail
  // line, not just the ~10px needed to grip the photo.
  // insetInlineStart centers it — logical property, RTL-safe either way.
  clip: {
    position: "absolute" as const,
    top: -15,
    insetInlineStart: "calc(50% - 10px)",
    width: 20,
    height: 25,
    borderRadius: "3px",
    bgcolor: "text.disabled",
    boxShadow: "0 2px 4px rgba(90, 45, 10, 0.12)",
    zIndex: 1,
  },

  // borderColor is deliberately text.disabled, not divider — divider is
  // what the rail line itself uses, and a matching border made the photo
  // frame blend into it instead of reading as a separate element.
  photoFrame: {
    position: "relative" as const,
    aspectRatio: "3 / 4",
    borderRadius: "16px",
    overflow: "hidden" as const,
    border: "1px solid",
    borderColor: "text.disabled",
    boxShadow: 2,
    bgcolor: "surface.placeholder",
  },
} as const;
