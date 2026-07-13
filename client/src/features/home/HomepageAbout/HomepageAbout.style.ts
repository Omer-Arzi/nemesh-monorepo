export const HomepageAboutStyle = {
  // Section band — compact vertical rhythm; this is a secondary homepage element.
  section: {
    py: { xs: 3, sm: 3.5, md: 4 },
    bgcolor: "background.paper",
  },

  // Editorial card: constrained max width, centred within PageContainer.
  // Height is driven entirely by content — no fixed or minimum heights.
  card: {
    maxWidth: "1040px",
    mx: "auto",
    borderRadius: "20px",
    border: "1px solid",
    borderColor: "divider",
    boxShadow: "0 4px 32px rgba(26, 18, 8, 0.05), 0 1px 6px rgba(26, 18, 8, 0.03)",
    bgcolor: "background.paper",
    p: { xs: 2, md: 3 },
  },

  title: {
    mb: { xs: 1.5, md: 2 },
    fontWeight: 700,
    color: "text.primary",
  },

  // Outer layout container.
  // display:flow-root creates a BFC: contains the floated imageWrapper so the
  // card grows to the full image height automatically, without an explicit clearfix.
  imageAndTextArea: {
    display: "flow-root" as const,
  },

  // Floated portrait image — slightly compact on desktop (220px wide ≈ 275px tall).
  // float: inline-end is a logical CSS value; in RTL resolves to physical left.
  // stylis-plugin-rtl does not flip logical values.
  // Mobile: full-width landscape crop so the card doesn't become excessively tall
  // when the image stacks above the text on small screens.
  imageWrapper: {
    display: "block" as const,
    position: "relative" as const,
    width: { xs: "100%", md: "220px" },
    aspectRatio: { xs: "4/3", md: "4/5" },
    float: { xs: "none", md: "inline-end" },
    // marginInlineStart in RTL = physical margin-right = gap between image and text.
    marginInlineStart: { xs: 0, md: "20px" },
    mb: { xs: 2, md: 0 },
    borderRadius: "12px",
    border: "1px solid",
    borderColor: "divider",
    overflow: "hidden" as const,
    flexShrink: 0,
  },

  // Text column beside the float.
  // overflow:hidden establishes a BFC so the column sits beside imageWrapper
  // without overlapping the float area.
  // Sibling combinator applies top margin between consecutive paragraphs.
  textColumn: {
    overflow: "hidden" as const,
    "& > * + *": { mt: 1.5 },
  },

  // Individual preview paragraph — content-driven height, no clipping.
  previewParagraph: {
    lineHeight: 1.85,
    color: "text.primary",
  },
} as const;
