export const BlockRendererStyle = {
  root: {
    // Force RTL text alignment on the content body, guarding against any ancestor
    // textAlign: "center" that could cascade in from page-level header styles.
    textAlign: "start" as const,

    // Base vertical gap between all sibling blocks.
    "& > * + *": {
      mt: 2,
    },
    // Headings that follow other content get extra breathing room.
    "& > * + h2, & > * + h3, & > * + h4, & > * + h5, & > * + h6": {
      mt: 4,
    },
  },

  paragraph: {
    lineHeight: 1.85,
    color: "text.primary",
    mb: 0,
  },

  // Rendered in place of an empty paragraph block to produce a predictable
  // visual gap. Height is smaller than a full line so consecutive spacers don't
  // create excessive whitespace.
  paragraphSpacer: {
    height: "0.6em",
  },

  // Paragraph entered with a "* " prefix in the Blocks editor (Markdown-style bullet).
  // Uses display:list-item so the browser places the marker correctly in RTL.
  // marginInlineStart is a logical property — in RTL it becomes margin-right, keeping
  // bullets indented from the reading start edge.
  fakeBulletItem: {
    display: "list-item",
    listStyleType: "disc",
    marginInlineStart: "1.5rem",
    lineHeight: 1.85,
    color: "text.primary",
    fontSize: "1rem",
    mb: 0,
  },

  heading: {
    fontWeight: 700,
    mb: 0.5,
    color: "text.primary",
  },

  list: {
    // paddingInlineStart is an RTL-aware logical property. Using pr/pl here would be
    // swapped by stylis-plugin-rtl, zeroing out the bullet indentation in RTL.
    paddingInlineStart: "1.5rem",
    m: 0,
  },

  listItem: {
    display: "list-item",
    lineHeight: 1.85,
    mb: 0.5,
  },

  blockquote: {
    borderRight: "4px solid",
    borderColor: "primary.light",
    pr: 2,
    pl: 0,
    py: 1,
    mx: 0,
    bgcolor: "action.hover",
    borderRadius: "0 4px 4px 0",
  },

  quoteText: {
    fontStyle: "italic",
    color: "text.secondary",
    lineHeight: 1.8,
  },

  codeBlock: {
    bgcolor: "action.hover",
    px: 2,
    py: 1.5,
    borderRadius: 1,
    overflow: "auto",
    fontFamily: "monospace",
    fontSize: "0.875rem",
    m: 0,
    direction: "ltr" as const,
    textAlign: "left" as const,
  },

  inlineCode: {
    fontFamily: "monospace",
    fontSize: "0.875em",
    bgcolor: "action.hover",
    px: 0.5,
    py: 0.125,
    borderRadius: 0.5,
  },

  link: {
    color: "primary.main",
    textDecoration: "underline",
    "&:hover": {
      color: "primary.dark",
    },
  },

  imageWrapper: {
    my: 2,
  },
} as const;
