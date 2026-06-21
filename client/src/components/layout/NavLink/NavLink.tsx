"use client";

import Button from "@mui/material/Button";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { NavLinkStyle } from "./styles/NavLinkStyle";

type Props = {
  href: string;
  children: React.ReactNode;
};

/**
 * Desktop navigation link.
 *
 * Renders as a MUI Button with active-path highlighting.
 * Uses `startsWith` so a parent route (e.g. /recipes) stays active
 * on child routes (e.g. /recipes/my-recipe).
 *
 * TODO: Refine active indicator style once the visual design is finalised.
 */
export default function NavLink({ href, children }: Props) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Button
      component={NextLink}
      href={href}
      color="inherit"
      sx={NavLinkStyle.root(isActive)}
    >
      {children}
    </Button>
  );
}
