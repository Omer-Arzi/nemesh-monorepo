import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { getCategoryBySlug } from "@/lib/api/services/categoryService";
import { getRecipesByCategory } from "@/lib/api/services/recipeService";
import CategoryPageClient from "./CategoryPageClient";
import { CategoryPageText } from "./consts";
import { getSiteUrl, SITE_NAME, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { ROUTES } from "@/constants";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // A genuinely-missing category resolves to `null`, not a thrown error — see
  // the `.catch` note on the page component below. Metadata generation is
  // additionally wrapped so a transient failure here just falls back to the
  // root layout's default metadata instead of failing the whole request.
  const category = await getCategoryBySlug(slug).catch(() => null);
  if (!category) return {};

  const base = getSiteUrl();
  // Built from the category's own stored `slug`, never the raw URL param —
  // so a differently-cased request (`/categories/Chicken`) still generates
  // the one, real canonical URL rather than echoing back whatever casing was
  // requested.
  const canonicalUrl = `${base}${ROUTES.CATEGORY(category.slug)}`;
  const displayName = category.menuName ?? category.name;
  const title = CategoryPageText.metaTitle(displayName);
  const description =
    category.description?.trim() || CategoryPageText.metaDescriptionFallback(displayName);

  const ogImages = category.image?.url
    ? [
        {
          url: category.image.url,
          width: category.image.width || undefined,
          height: category.image.height || undefined,
          alt: category.image.alt || title,
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

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  // Deliberately NOT wrapped in try/catch: `getCategoryBySlug` resolves to
  // `null` on a normal, successful "no match" response from Strapi — that's
  // the only case that should 404. A real Strapi outage/network failure
  // throws here instead, and Next renders the nearest error boundary (a 5xx),
  // so a temporary backend hiccup can never be mistaken for "category
  // doesn't exist" and turned into a permanent 404.
  //
  // Also deduplicated by Next's fetch cache against the identical call in
  // generateMetadata above — no extra network round trip.
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  // `getCategoryBySlug` matches case-insensitively, so a differently-cased
  // URL (`/categories/Chicken`) still resolves to a real category here.
  // Permanently redirect to the stored, lowercase slug instead of serving —
  // and letting Google index — a second URL for the same category.
  if (category.slug !== slug) {
    permanentRedirect(ROUTES.CATEGORY(category.slug));
  }

  // Recipes are allowed to fail independently of the category lookup above:
  // a transient error here shouldn't take down an otherwise-healthy category
  // page. `CategoryPageClient` falls back to its normal client-side
  // fetch/loading state when this is `null`.
  const recipesResult = await getRecipesByCategory(category.slug).catch(() => null);

  return (
    <CategoryPageClient
      slug={category.slug}
      initialCategory={category}
      initialRecipes={recipesResult}
    />
  );
}
