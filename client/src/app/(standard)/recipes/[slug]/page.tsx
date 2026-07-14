import type { Metadata } from "next";
import { getRecipeBySlug } from "@/lib/api/services/recipeService";
import RecipePageClient from "./RecipePageClient";
import StructuredData from "@/components/seo/StructuredData";
import { buildRecipeSchema, buildBreadcrumbSchema, getSiteUrl, SITE_NAME, DEFAULT_OG_IMAGE } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const recipe = await getRecipeBySlug(slug).catch(() => null);

  const base = getSiteUrl();
  const canonicalUrl = `${base}/recipes/${slug}`;
  const title = recipe?.title ?? SITE_NAME;
  const description =
    recipe?.description?.trim().replace(/\n+/g, " ") || undefined;

  const ogImages = recipe?.image?.url
    ? [
        {
          url: recipe.image.url,
          width: recipe.image.width || undefined,
          height: recipe.image.height || undefined,
          alt: recipe.image.alt || title,
        },
      ]
    : [{ url: `${base}${DEFAULT_OG_IMAGE}`, alt: SITE_NAME }];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: "he_IL",
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages.map((img) => img.url),
    },
  };
}

export default async function RecipePage({ params }: Props) {
  const { slug } = await params;
  // getRecipeBySlug is deduplicated by Next.js fetch cache — no extra network call
  // on top of the generateMetadata call above.
  const recipe = await getRecipeBySlug(slug).catch(() => null);

  return (
    <>
      {recipe && (
        <>
          <StructuredData data={buildRecipeSchema(recipe)} />
          <StructuredData data={buildBreadcrumbSchema(recipe)} />
        </>
      )}
      <RecipePageClient slug={slug} />
    </>
  );
}
