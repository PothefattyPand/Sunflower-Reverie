import { BookOpen, Sparkles } from "lucide-react";
import { Container } from "@/components/common/Container";
import { JournalListing } from "@/components/journal/JournalListing";
import { fetchPublicationsByCategory, fetchAllAuthors } from "@/data/publications";

export const metadata = {
  title: "Pages of Reflection | The Journal | Sunflower Reverie",
  description:
    "Chronological field notes, morning reflections, and contemplative moments selected for public reading from Sunflower Reverie.",
};

export default async function JournalPage() {
  const [entries, authors] = await Promise.all([
    fetchPublicationsByCategory("journal"),
    fetchAllAuthors(),
  ]);

  return (
    <div className="py-16 sm:py-24 bg-[#FFF9EC]">
      <Container className="max-w-4xl">
        {/* Header */}
        <header className="text-center max-w-2xl mx-auto mb-16 sm:mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFF3D9] border border-[#EADBCE] text-xs font-patrick uppercase tracking-widest text-[#718B55]">
            <BookOpen className="w-3.5 h-3.5 text-[#E8AF30]" />
            <span>The Garden Chronicle</span>
          </div>

          <h1 className="font-caveat text-5xl sm:text-7xl font-bold tracking-tight text-[#3B3028] leading-[1.05]">
            Pages of Reflection
          </h1>

          <p className="font-kalam text-xl sm:text-2xl text-[#6B584C] leading-relaxed">
            Unfiltered fragments from the writing desk, observations of morning dew,
            and gentle field notes intentionally shared with readers.
          </p>

          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-[#6B584C] bg-[#FFF3D9]/70 px-3 py-1 rounded-full border border-[#EADBCE] font-nunito">
              <Sparkles className="w-3 h-3 text-[#E8AF30]" />
              Field Notes &amp; Morning Reflections
            </span>
          </div>
        </header>

        {/* Interactive Dated Timeline Listing */}
        <JournalListing initialPublications={entries} authors={authors} />
      </Container>
    </div>
  );
}
