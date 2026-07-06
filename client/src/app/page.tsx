import { getHomepage } from "@/lib/api/services";
import HomeSearchHero from "@/features/home/HomeSearchHero";
import LatestRecipes from "@/features/home/LatestRecipes";
import FeaturedCategoriesCarousel from "@/features/home/FeaturedCategoriesCarousel";
import { PageViewTracker } from "@/lib/analytics";

export default async function HomePage() {
  // Fetched server-side so the first HTML already contains either the Strapi
  // text or the stable default fallback — no client-side loading state needed.
  const homepage = await getHomepage().catch(() => null);

  return (
    <>
      <PageViewTracker page_id="home" page_name="דף הבית" />
      <HomeSearchHero
        title={homepage?.heroTitle ?? null}
        subtitle={homepage?.heroSubtitle ?? null}
        backgroundImage={homepage?.heroBackgroundImage ?? null}
      />
      <LatestRecipes sectionTitle={homepage?.latestRecipesTitle ?? null} />
      <FeaturedCategoriesCarousel sectionTitle={homepage?.featuredCategoriesTitle ?? null} />
    </>
  );
}
