"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import NextImage from "next/image";
import type {
  BlockNode,
  BlockInlineNode,
  BlockTextNode,
  BlockListItemNode,
} from "@/types/domain";
import { BlockRendererStyle } from "./BlockRenderer.style";

function renderTextNode(node: BlockTextNode, key: number): React.ReactNode {
  let content: React.ReactNode = node.text;
  if (node.bold) content = <strong key={`b-${key}`}>{content}</strong>;
  if (node.italic) content = <em key={`i-${key}`}>{content}</em>;
  if (node.underline) content = <u key={`u-${key}`}>{content}</u>;
  if (node.strikethrough) content = <s key={`s-${key}`}>{content}</s>;
  if (node.code) content = <Box component="code" sx={BlockRendererStyle.inlineCode} key={`c-${key}`}>{content}</Box>;
  return content;
}

function renderInlineNode(node: BlockInlineNode, idx: number): React.ReactNode {
  if (node.type === "link") {
    const isExternal = node.url.startsWith("http");
    return (
      <Link
        key={idx}
        href={node.url}
        sx={BlockRendererStyle.link}
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {node.children.map((child, i) => renderTextNode(child, i))}
      </Link>
    );
  }
  return <React.Fragment key={idx}>{renderTextNode(node, idx)}</React.Fragment>;
}

function renderListItem(node: BlockListItemNode, idx: number): React.ReactNode {
  return (
    <Typography component="li" key={idx} sx={BlockRendererStyle.listItem}>
      {node.children.map((child, i) => renderInlineNode(child, i))}
    </Typography>
  );
}

function renderBlock(block: BlockNode, idx: number): React.ReactNode {
  switch (block.type) {
    case "paragraph":
      return (
        <Typography key={idx} variant="body1" sx={BlockRendererStyle.paragraph}>
          {block.children.map((child, i) => renderInlineNode(child, i))}
        </Typography>
      );

    case "heading": {
      const variantMap = {
        1: "h1",
        2: "h2",
        3: "h3",
        4: "h4",
        5: "h5",
        6: "h6",
      } as const;
      return (
        <Typography key={idx} variant={variantMap[block.level]} sx={BlockRendererStyle.heading}>
          {block.children.map((child, i) => renderInlineNode(child, i))}
        </Typography>
      );
    }

    case "list": {
      const isOrdered = block.format === "ordered";
      return (
        <Box
          key={idx}
          component={isOrdered ? "ol" : "ul"}
          sx={{ ...BlockRendererStyle.list, listStyleType: isOrdered ? "decimal" : "disc" }}
        >
          {block.children.map((child, i) => renderListItem(child, i))}
        </Box>
      );
    }

    case "quote":
      return (
        <Box key={idx} component="blockquote" sx={BlockRendererStyle.blockquote}>
          <Typography variant="body1" sx={BlockRendererStyle.quoteText}>
            {block.children.map((child, i) => renderInlineNode(child, i))}
          </Typography>
        </Box>
      );

    case "code":
      return (
        <Box key={idx} component="pre" sx={BlockRendererStyle.codeBlock}>
          <code>{block.children.map((child) => child.text).join("")}</code>
        </Box>
      );

    case "image": {
      const { url, alternativeText, width, height } = block.image;
      return (
        <Box key={idx} sx={BlockRendererStyle.imageWrapper}>
          <NextImage
            src={url}
            alt={alternativeText ?? ""}
            width={width}
            height={height}
            style={{ maxWidth: "100%", height: "auto", borderRadius: 8, display: "block", margin: "0 auto" }}
          />
        </Box>
      );
    }

    default:
      return null;
  }
}

type Props = {
  blocks: BlockNode[];
};

export default function BlockRenderer({ blocks }: Props) {
  if (!blocks || blocks.length === 0) return null;
  return (
    <Box sx={BlockRendererStyle.root}>
      {blocks.map((block, idx) => renderBlock(block, idx))}
    </Box>
  );
}
