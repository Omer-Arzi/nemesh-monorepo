"use client";

import Box from "@mui/material/Box";
import Footer from "../Footer";
import Header from "../Header";
import { AppShellStyle } from "./styles/AppShellStyle";

type Props = {
  children: React.ReactNode;
};

/**
 * Root application shell — the persistent structural frame around all pages.
 *
 * Structure (flex column, full viewport height):
 *
 *   ┌─────────────────────────────────┐
 *   │  Header (sticky)                │
 *   ├─────────────────────────────────┤
 *   │                                 │
 *   │  <main>  (flex: 1, scrollable)  │
 *   │    {children / page content}    │
 *   │                                 │
 *   ├─────────────────────────────────┤
 *   │  Footer                         │
 *   └─────────────────────────────────┘
 *
 * The <main> region grows to fill remaining height so the footer always
 * sits at or below the fold, even on short pages.
 *
 * AppShell does NOT impose a Container or horizontal padding on the main
 * area — each page decides its own content width.  Use PageContainer for
 * the standard centred layout, or go full-width when needed (e.g. hero).
 */
export default function AppShell({ children }: Props) {
  return (
    <Box sx={AppShellStyle.root}>
      <Header />

      <Box component="main" sx={AppShellStyle.main}>
        {children}
      </Box>

      <Footer />
    </Box>
  );
}
