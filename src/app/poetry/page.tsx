import { Feather, Sparkles } from "lucide-react";
import { Container } from "@/components/common/Container";
import { PoetryListing } from "@/components/poetry/PoetryListing";
import { fetchPublicationsByCategory, fetchAllAuthors } from "@/data/publications";

export const metadata = {
  title: "Verses in Bloom | Poetry Collection | Sunflower Reverie",
  description:
    "Lyrical cadences, elegies, and stanzas celebrating quiet dawns, sunflowers, and the shifting seasons.",
};

export default async function PoetryPage() {
  const [poems, authors] = await Promise.all([
    fetchPublicationsByCategory("poetry"),
    fetchAllAuthors(),
  ]);

  return (
    <div className="py-16 sm:py-24 bg-[#FFF9EC]">
      <Container className="max-w-5xl">
        {/* Header */}
        <header className="text-center max-w-2xl mx-auto mb-16 sm:mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFF3D9] border border-[#EADBCE] text-xs font-patrick uppercase tracking-widest text-[#718B55]">
            <Feather className="w-3.5 h-3.5 text-[#E8AF30]" />
            <span>The Poetic Folio</span>
          </div>

          <h1 className="font-caveat text-5xl sm:text-7xl font-bold tracking-tight text-[#3B3028] leading-[1.05]">
            Verses in Bloom
          </h1>

          <p className="font-kalam text-xl sm:text-2xl text-[#6B584C] leading-relaxed">
            Words shaped by meter, pause, and breath. Written for the unhurried hour,
            when shadows stretch long across the garden grass.
          </p>

          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-[#6B584C] bg-[#FFF3D9]/70 px-3 py-1 rounded-full border border-[#EADBCE] font-nunito">
              <Sparkles className="w-3 h-3 text-[#E8AF30]" />
              Poetic Sanctuary • Verses in Bloom
            </span>
          </div>
        </header>

        {/* Interactive Poetry Listing with Search & Theme Filter */}
        <PoetryListing initialPublications={poems} authors={authors} />
      </Container>
    </div>
  );
}
