import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRecipeBySlug } from "@/lib/api/services/recipeService";
import RecipePrintDocument, { buildRecipePrintPageStyle } from "@/components/domain/RecipePrintDocument";
import { getSiteUrl } from "@/lib/seo";
import { ROUTES } from "@/constants";

type Props = {
  params: Promise<{ slug: string }>;
};

// Render-only target for the PDF endpoint (`/api/recipes/[slug]/pdf`). It is
// never linked from the site, so keep it out of search results.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Bare print document — the same `RecipePrintDocument` and `@page` rules the
 * on-screen Print button uses, with no site chrome around it. A headless
 * browser loads this route and prints it to PDF, so the shared file is the
 * exact printed format.
 */
export default async function RecipePrintPage({ params }: Props) {
  const { slug } = await params;

  const recipe = await getRecipeBySlug(slug);
  if (!recipe) notFound();

  return (
    <>
      <style>{buildRecipePrintPageStyle(`${getSiteUrl()}${ROUTES.RECIPE(slug)}`)}</style>
      {/* The root layout's CssBaseline paints <body> with the active theme's
          page colour. The react-to-print iframe never had that — it is white
          paper — so match it. */}
      <style>{"html, body { background: #fff !important; }"}</style>
      <RecipePrintDocument recipe={recipe} />
    </>
  );
}
