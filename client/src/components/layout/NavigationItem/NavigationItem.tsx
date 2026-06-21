"use client";

import type { ElementType } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { NavigationItemStyle } from "./NavigationItem.style";

type Props = {
  label: string;
  href: string;
  icon: ElementType;
  railOpen?: boolean;
  onClick?: () => void;
  loading?: boolean;
  neverActive?: boolean;
};

export default function NavigationItem({
  label,
  href,
  icon: Icon,
  railOpen = true,
  onClick,
  loading = false,
  neverActive = false,
}: Props) {
  const pathname = usePathname();
  const active =
    !onClick &&
    !neverActive &&
    (pathname === href || pathname.startsWith(`${href}/`));

  const isButton = Boolean(onClick);

  return (
    <Box
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component={isButton ? ("button" as any) : NextLink}
      {...(isButton ? { onClick, type: "button" } : { href })}
      sx={[
        NavigationItemStyle.root(active),
        ...(isButton ? [NavigationItemStyle.buttonReset] : []),
        ...(loading ? [NavigationItemStyle.loadingState] : []),
      ]}
    >
      {loading ? (
        <CircularProgress size={20} thickness={4} sx={{ color: "text.secondary", flexShrink: 0 }} />
      ) : (
        <Icon sx={NavigationItemStyle.icon(active)} />
      )}
      <Typography component="span" sx={NavigationItemStyle.label(active, railOpen)}>
        {label}
      </Typography>
    </Box>
  );
}
