import { Container } from "@/components/common/Container";
import { WritingsListing } from "@/components/writings/WritingsListing";
import { fetchPublicationsByCategory, fetchAllAuthors } from "@/data/publications";
import { Feather, Sparkles } from "lucide-react";

export const metadata = {
  title: "Letters & Other Words | Writings | Sunflower Reverie",
  description:
    "An open repository of short stories, contemplative memoirs, letters, and creative prose from Sunflower Reverie.",
};

export default async function WritingsPage() {
  const [writings, authors] = await Promise.all([
    fetchPublicationsByCategory("writing"),
    fetchAllAuthors(),
  ]);

  return (
    <div className="py-16 sm:py-24 bg-[#FFF9EC]">
      <Container className="max-w-5xl">
        {/* Header */}
        <header className="text-center max-w-2xl mx-auto mb-14 sm:mb-18 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFF3D9] border border-[#EADBCE] text-xs font-patrick uppercase tracking-widest text-[#718B55]">
            <Feather className="w-3.5 h-3.5 text-[#E8AF30]" />
            <span>The Literary Folio</span>
          </div>

          <h1 className="font-caveat text-5xl sm:text-7xl font-bold tracking-tight text-[#3B3028] leading-[1.05]">
            Letters &amp; Other Words
          </h1>

          <p className="font-kalam text-xl sm:text-2xl text-[#6B584C] leading-relaxed">
            Essays, short narratives, epistolary letters, and creative reflections.
            Written for contemplative afternoons and quiet lamps.
          </p>

          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-[#6B584C] bg-[#FFF3D9]/70 px-3 py-1 rounded-full border border-[#EADBCE] font-nunito">
              <Sparkles className="w-3 h-3 text-[#E8AF30]" />
              Literary Archive • Filterable by Topic &amp; Genre
            </span>
          </div>
        </header>

        {/* Interactive Listing */}
        <WritingsListing initialPublications={writings} authors={authors} />
      </Container>
    </div>
  );
}
