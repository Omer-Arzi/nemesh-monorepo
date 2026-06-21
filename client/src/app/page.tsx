import HomeSearchHero from "@/features/home/HomeSearchHero";
import LatestRecipes from "@/features/home/LatestRecipes";
import FeaturedCategoriesCarousel from "@/features/home/FeaturedCategoriesCarousel";

export default function HomePage() {
  return (
    <>
      <HomeSearchHero />
      <LatestRecipes />
      <FeaturedCategoriesCarousel />
    </>
  );
}
