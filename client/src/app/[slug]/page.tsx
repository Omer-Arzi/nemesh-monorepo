import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPageBySlug, getPageSlugs } from "@/lib/api/services/pageService";
import StaticPageClient from "./StaticPageClient";

const fetchPage = cache(getPageBySlug);

export async function generateStaticParams() {
  const slugs = await getPageSlugs().catch(() => []);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await fetchPage(slug).catch(() => null);
  if (!page) return {};
  return {
    title: page.title,
    description: page.summary ?? undefined,
  };
}

export default async function StaticPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await fetchPage(slug).catch(() => null);
  if (!page) notFound();
  return <StaticPageClient page={page} />;
}
