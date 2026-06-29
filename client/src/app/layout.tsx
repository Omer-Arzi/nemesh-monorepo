import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import RootProviders from "@/providers";
import AppShell from "@/components/layout/AppShell";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-heebo",
  display: "swap",
});

/**
 * Root layout — server component that sets the HTML skeleton.
 *
 * Responsibility split:
 *   RootProviders  → MUI theme, Emotion SSR, TanStack Query
 *   AppShell       → Header, <main>, Footer (persistent across all routes)
 *   {children}     → per-page content rendered into <main>
 *
 * TODO: Set real title/description/icons once branding is decided.
 */
export const metadata: Metadata = {
  title: {
    default: "Nemesh",
    template: "%s | Nemesh",
  },
  description: "Nemesh", // TODO: replace with product description
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body>
        <RootProviders>
          <AppShell>{children}</AppShell>
        </RootProviders>
        <SpeedInsights />
      </body>
    </html>
  );
}
