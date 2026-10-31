import { Container } from "@/components/common/Container";
import { BlogListing } from "@/components/blogs/BlogListing";
import { fetchPublicationsByCategory, fetchAllAuthors } from "@/data/publications";
import { Sparkles, Sun } from "lucide-react";

export const metadata = {
  title: "Thoughts Beneath the Sun | Blogs | Sunflower Reverie",
  description:
    "Reflections on literary craft, mindful living, and quiet morning insights from Sunflower Reverie.",
};

export default async function BlogsPage() {
  const [blogs, authors] = await Promise.all([
    fetchPublicationsByCategory("blog"),
    fetchAllAuthors(),
  ]);

  return (
    <div className="py-16 sm:py-24 bg-[#FFF9EC]">
      <Container className="max-w-5xl">
        {/* Header */}
        <header className="text-center max-w-2xl mx-auto mb-14 sm:mb-18 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFF3D9] border border-[#EADBCE] text-xs font-patrick uppercase tracking-widest text-[#718B55]">
            <Sun className="w-3.5 h-3.5 text-[#E8AF30]" />
            <span>The Blog Folio</span>
          </div>

          <h1 className="font-caveat text-5xl sm:text-7xl font-bold tracking-tight text-[#3B3028] leading-[1.05]">
            Thoughts Beneath the Sun
          </h1>

          <p className="font-kalam text-xl sm:text-2xl text-[#6B584C] leading-relaxed">
            Observations on the creative life, books read beneath the garden shade,
            and gentle dispatches sent outward on the morning breeze.
          </p>

          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-[#6B584C] bg-[#FFF3D9]/70 px-3 py-1 rounded-full border border-[#EADBCE] font-nunito">
              <Sparkles className="w-3 h-3 text-[#E8AF30]" />
              Literary Sanctuary • Sunflower Reverie
            </span>
          </div>
        </header>

        {/* Interactive Listing */}
        <BlogListing initialPublications={blogs} authors={authors} />
      </Container>
    </div>
  );
}
