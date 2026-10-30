import { SunflowerHero } from "@/components/home/SunflowerHero";
import { AuthorIntroduction } from "@/components/home/AuthorIntroduction";
import { FeaturedWritings } from "@/components/home/FeaturedWritings";
import { CategoryCard } from "@/components/home/CategoryCard";
import { LiteraryQuote } from "@/components/home/LiteraryQuote";
import { LatestPublications } from "@/components/home/LatestPublications";
import {
  fetchSiteSettings,
  fetchAllAuthors,
  fetchFeaturedPublications,
  fetchLatestPublications,
} from "@/data/publications";

export default async function HomePage() {
  const [settings, authors, featured, latest] = await Promise.all([
    fetchSiteSettings(),
    fetchAllAuthors(),
    fetchFeaturedPublications(),
    fetchLatestPublications(3),
  ]);

  return (
    <div className="flex flex-col w-full bg-[#FFF9EC] text-[#3B3028]">
      {/* Interactive Sunflower Hero with Animated Garden */}
      <SunflowerHero
        tagline={settings?.tagline}
        welcomeMessage={settings?.welcomeMessage}
      />

      {/* SECTION 1: Meet Our Two Authors */}
      <AuthorIntroduction authors={authors} />

      {/* SECTION 2: Featured Writings */}
      <FeaturedWritings featured={featured} />

      {/* SECTION 3: Explore the Garden of Words */}
      <CategoryCard />

      {/* SECTION 4: Quiet Literary Quote */}
      <LiteraryQuote />

      {/* SECTION 5: Latest Publications */}
      <LatestPublications latest={latest} />
    </div>
  );
}
