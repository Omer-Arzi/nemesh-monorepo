import AppShell from "@/components/layout/AppShell";

/**
 * Route-group layout for every route except "/" (categories, recipes,
 * results, tags, static pages). See src/app/(home)/layout.tsx for why the
 * pageMode is hardcoded here rather than derived from usePathname().
 */
export default function StandardLayout({ children }: { children: React.ReactNode }) {
  return <AppShell pageMode="standard">{children}</AppShell>;
}
