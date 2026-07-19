import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageContainer } from "@/components/shared";
import { getAboutPage } from "@/lib/api/services";
import AboutIntro from "@/features/about/AboutIntro";

export async function generateMetadata(): Promise<Metadata> {
  const about = await getAboutPage().catch(() => null);
  // No manual "| Nemesh" suffix — the root layout's title.template already
  // appends it (see src/app/layout.tsx), same as every other page. Omitting
  // the key when there's no title falls back to the root's default title,
  // instead of literally rendering the string "null".
  if (!about?.title) return {};
  return { title: about.title };
}

export default async function AboutPage() {
  const about = await getAboutPage().catch(() => null);
  if (!about) notFound();

  return (
    <PageContainer>
      <AboutIntro about={about} />
    </PageContainer>
  );
}
