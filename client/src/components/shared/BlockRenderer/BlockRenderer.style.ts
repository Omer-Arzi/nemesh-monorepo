export const BlockRendererStyle = {
  root: {
    // Base gap between all blocks
    "& > * + *": {
      mt: 2,
    },
    // Headings following other content get more breathing room
    "& > * + h2, & > * + h3, & > * + h4, & > * + h5, & > * + h6": {
      mt: 4,
    },
  },
  paragraph: {
    lineHeight: 1.85,
    color: "text.primary",
  },
  heading: {
    fontWeight: 700,
    mb: 0.5,
    color: "text.primary",
  },
  list: {
    // paddingInlineStart is an RTL-aware logical property — the RTL plugin does NOT flip it.
    // Using pr/pl here would be swapped by stylis-plugin-rtl, breaking RTL bullet indentation.
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
