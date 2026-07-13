import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import RootProviders from "@/providers";
import AppShell from "@/components/layout/AppShell";
import { getSiteSettings } from "@/lib/api/services/siteSettingService";
import { GoogleAnalyticsScript } from "@/lib/analytics";

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
    default: "Nemesh | נמש – אתר מתכונים פרטי",
    template: "%s | Nemesh",
  },
  description:
    "נמש הוא אתר מתכונים פרטי עם מתכונים מקוריים, קינוחים, גלידות ביתיות, מנות עיקריות ועוד. חפשו מתכונים לפי קטגוריה, מרכיבים או השראה.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { activeThemeKey, branding } = await getSiteSettings();

  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body>
        <RootProviders activePresetKey={activeThemeKey ?? undefined} branding={branding}>
          <AppShell>{children}</AppShell>
        </RootProviders>
        <GoogleAnalyticsScript />
        <SpeedInsights />
      </body>
    </html>
  );
}
