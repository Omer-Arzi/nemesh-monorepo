/**
 * Shared next/font instances.
 *
 * Kept in a plain (non-"use client") module so both the server `RootLayout`
 * (which applies `heebo.variable` to <html>) and client code that needs the
 * resolved family name (`heebo.style.fontFamily`) can import the same
 * instance. The print document (RecipePrintDocument) binds this family
 * directly because the `--font-heebo` CSS variable is set on <html> and does
 * not cross into the react-to-print iframe.
 */
import { Heebo } from "next/font/google";

export const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-heebo",
  display: "swap",
});

/**
 * Font stack for contexts that cannot rely on the `--font-heebo` variable
 * (notably the print iframe). The hashed next/font family already carries its
 * own adjusted fallback face; the explicit tail is a last resort.
 */
export const HEEBO_FONT_STACK = `${heebo.style.fontFamily}, "Helvetica Neue", Arial, sans-serif`;
