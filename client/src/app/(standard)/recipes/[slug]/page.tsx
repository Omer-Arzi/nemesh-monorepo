import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRecipeBySlug, getRelatedRecipes } from "@/lib/api/services/recipeService";
import RecipePageClient from "./RecipePageClient";
import StructuredData from "@/components/seo/StructuredData";
import { buildRecipeSchema, buildBreadcrumbSchema, getSiteUrl, SITE_NAME, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { ROUTES } from "@/constants";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // A genuinely-missing recipe resolves to `null`, not a thrown error — see
  // the page component below. Metadata generation is additionally wrapped so
  // a transient failure here just falls back to the root layout's default
  // metadata instead of failing the whole request.
  const recipe = await getRecipeBySlug(slug).catch(() => null);
  if (!recipe) return {};

  const base = getSiteUrl();
  const canonicalUrl = `${base}${ROUTES.RECIPE(slug)}`;
  const title = recipe.title;
  const description = recipe.description?.trim().replace(/\n+/g, " ") || undefined;

  const ogImages = recipe.image?.url
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
    alternates: { canonical: canonicalUrl },
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

  // Deliberately NOT wrapped in try/catch: `getRecipeBySlug` resolves to
  // `null` on a normal, successful "no match" response from Strapi — that's
  // the only case that should 404. A real Strapi outage/network failure
  // throws here instead, and Next renders the nearest error boundary (a
  // 5xx), so a temporary backend hiccup can never be mistaken for "recipe
  // doesn't exist" and turned into a permanent 404.
  //
  // Also deduplicated by Next's fetch cache against the identical call in
  // generateMetadata above — no extra network round trip.
  const recipe = await getRecipeBySlug(slug);
  if (!recipe) notFound();

  // Related recipes are allowed to fail independently: a transient error
  // here shouldn't take down an otherwise-healthy recipe page.
  // RecipePageClient's related-recipes rail simply renders empty in that
  // case, same as it always has when there are genuinely no related recipes.
  const relatedRecipes = await getRelatedRecipes(slug).catch(() => []);

  return (
    <>
      <StructuredData data={buildRecipeSchema(recipe)} />
      <StructuredData data={buildBreadcrumbSchema(recipe)} />
      <RecipePageClient
        slug={slug}
        initialRecipe={recipe}
        initialRelatedRecipes={relatedRecipes}
      />
    </>
  );
}
