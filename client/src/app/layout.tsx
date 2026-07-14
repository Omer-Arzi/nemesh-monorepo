import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import RootProviders from "@/providers";
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
 *   RootProviders → MUI theme, Emotion SSR, TanStack Query (persistent
 *                   across every route — this file never changes per route)
 *   {children}    → the matched route group's own layout — either
 *                   (home)/layout.tsx or (standard)/layout.tsx — each of
 *                   which renders AppShell with a hardcoded pageMode.
 *
 * AppShell deliberately does NOT live here. It needs to know whether it's
 * rendering the home route deterministically at SSR/ISR time, and a
 * usePathname() read inside a shared "use client" layout has proven
 * unreliable for that during static generation. Route groups make Next's
 * own file-system router (not a runtime hook) the source of truth instead.
 * See docs/architecture.md for the full history.
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
          {children}
        </RootProviders>
        <GoogleAnalyticsScript />
        <SpeedInsights />
      </body>
    </html>
  );
}
