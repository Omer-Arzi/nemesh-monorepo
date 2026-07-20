import { getHomepage } from "@/lib/api/services";
import HomeHeroSection from "@/features/home/HomeHeroSection";
import FeatureSection from "@/features/home/FeatureSection";
import HomepageAbout from "@/features/home/HomepageAbout";
import LatestRecipes from "@/features/home/LatestRecipes";
import FeaturedCategoriesCarousel from "@/features/home/FeaturedCategoriesCarousel";
import { PageViewTracker } from "@/lib/analytics";
import StructuredData from "@/components/seo/StructuredData";
import { buildWebSiteSchema } from "@/lib/seo/structuredData";

export default async function HomePage() {
  // Fetched server-side so the first HTML already contains either the Strapi
  // text or the stable default fallback — no client-side loading state needed.
  const homepage = await getHomepage().catch(() => null);

  return (
    <>
      <StructuredData data={buildWebSiteSchema()} />
      <PageViewTracker page_id="home" page_name="דף הבית" />
      <HomeHeroSection
        title={homepage?.heroTitle ?? null}
        subtitle={homepage?.heroSubtitle ?? null}
        backgroundImage={homepage?.heroBackgroundImage ?? null}
      />
      <FeatureSection section={homepage?.featureSection ?? null} />
      <HomepageAbout about={homepage?.about ?? null} />
      <FeaturedCategoriesCarousel sectionTitle={homepage?.featuredCategoriesTitle ?? null} />
      <LatestRecipes sectionTitle={homepage?.latestRecipesTitle ?? null} />
    </>
  );
}
