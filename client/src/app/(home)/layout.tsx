import AppShell from "@/components/layout/AppShell";

/**
 * Route-group layout for "/" — the only route in this group.
 *
 * Passing a hardcoded pageMode="home" here (rather than having AppShell infer
 * it via usePathname()) is what makes the homepage's SSR/ISR output
 * deterministic: this file only ever renders for "/", by construction of
 * Next.js's file-system routing, independent of any runtime hook.
 */
export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return <AppShell pageMode="home">{children}</AppShell>;
}
