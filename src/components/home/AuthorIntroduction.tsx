import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Feather, Sparkles, BookOpen, SunMedium } from "lucide-react";
import { Container } from "@/components/common/Container";
import { AuthorProfile } from "@/types";

interface AuthorIntroductionProps {
  authors?: AuthorProfile[];
}

export function AuthorIntroduction({ authors = [] }: AuthorIntroductionProps) {
  const hasAuthor1 = authors.length >= 1;
  const hasAuthor2 = authors.length >= 2;
  const author1 = hasAuthor1 ? authors[0] : null;
  const author2 = hasAuthor2 ? authors[1] : null;

  return (
    <section className="py-20 sm:py-28 bg-[#FFF9EC] border-b border-[#EADBCE]/60">
      <Container className="max-w-6xl">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFF3D9] border border-[#EADBCE] text-xs font-patrick uppercase tracking-widest text-[#718B55]">
            <Sparkles className="w-3.5 h-3.5 text-[#E8AF30]" />
            <span>Section 1 • Literary Curators</span>
          </div>

          <h2 className="font-caveat text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#3B3028] leading-[1.05]">
            Meet Our Authors
          </h2>

          <p className="font-nunito text-base sm:text-lg text-[#6B584C] leading-relaxed">
            Sunflower Reverie is tended by two distinct voices sharing the same quiet sanctuary.
            Each author brings their own cadence of verse, essay, and reflective journal beneath the open sky.
          </p>
        </div>

        {/* Balanced Two-Author Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {/* Card 1: Author 1 (Real profile) */}
          {author1 ? (
            <div className="group relative flex flex-col justify-between rounded-3xl border-2 border-[#EADBCE] bg-[#FFF3D9]/80 hover:bg-[#FFF3D9] p-8 shadow-xs hover:shadow-md hover:border-[#E8AF30] transition-all duration-300">
              <div>
                {/* Botanical card header badge */}
                <div className="flex items-center justify-between text-[#718B55] mb-6 pb-3 border-b border-[#EADBCE]/80">
                  <span className="font-patrick text-xs uppercase tracking-widest text-[#6B584C] flex items-center gap-1.5 font-bold">
                    <Feather className="w-3.5 h-3.5 text-[#E8AF30]" />
                    Author 1
                  </span>
                  <span className="text-xs font-nunito italic text-[#6B584C]">
                    Sunflower Folio
                  </span>
                </div>

                {/* Portrait circle */}
                <div className="text-center space-y-4 mb-5">
                  <div className="relative mx-auto w-28 h-28 rounded-full border-3 border-[#E8AF30] bg-[#FFF9EC] flex items-center justify-center shadow-inner overflow-hidden group-hover:scale-105 transition-transform duration-300">
                    {author1.pictureUrl ? (
                      <Image
                        src={author1.pictureUrl}
                        alt={author1.name}
                        width={112}
                        height={112}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Feather className="w-12 h-12 text-[#3B3028]/80 stroke-[1.5]" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-patrick text-3xl font-bold text-[#3B3028] group-hover:text-[#E8AF30] transition-colors">
                      <Link href={`/authors/${author1.slug}`}>
                        {author1.name}
                      </Link>
                    </h3>
                    <p className="text-xs sm:text-sm font-nunito font-semibold text-[#718B55] mt-1">
                      {author1.role || "Co-Curator & Author"}
                    </p>
                  </div>
                </div>

                {/* Short Bio */}
                <p className="font-nunito text-sm sm:text-base text-[#3B3028]/90 leading-relaxed text-center mb-6">
                  {author1.shortBio || "Dedicated to quiet morning reflections, classical nature poetry, and the unhurried craft of contemplative prose."}
                </p>
              </div>

              {/* Footer Quote & Action */}
              <div className="pt-4 border-t border-[#EADBCE]/80 space-y-4">
                {author1.quote && (
                  <p className="font-kalam text-sm sm:text-base text-[#6B584C] italic text-center">
                    &ldquo;{author1.quote}&rdquo;
                  </p>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Link
                    href={`/authors/${author1.slug}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#FFF9EC] hover:bg-[#F4C542]/20 text-[#3B3028] border border-[#EADBCE] hover:border-[#E8AF30] font-patrick text-base font-bold transition-all duration-200 group/btn shadow-xs"
                  >
                    <BookOpen className="w-4 h-4 text-[#718B55]" />
                    <span>View Author Folio</span>
                    <ArrowRight className="w-4 h-4 text-[#E8AF30] group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ) : null}

          {/* Card 2: Author 2 (Live if present, or Reserved Alcove without inventing fake identity) */}
          {author2 ? (
            <div className="group relative flex flex-col justify-between rounded-3xl border-2 border-[#EADBCE] bg-[#FFF3D9]/80 hover:bg-[#FFF3D9] p-8 shadow-xs hover:shadow-md hover:border-[#E8AF30] transition-all duration-300">
              <div>
                <div className="flex items-center justify-between text-[#718B55] mb-6 pb-3 border-b border-[#EADBCE]/80">
                  <span className="font-patrick text-xs uppercase tracking-widest text-[#6B584C] flex items-center gap-1.5 font-bold">
                    <Feather className="w-3.5 h-3.5 text-[#E8AF30]" />
                    Author 2
                  </span>
                  <span className="text-xs font-nunito italic text-[#6B584C]">
                    Sunflower Folio
                  </span>
                </div>

                <div className="text-center space-y-4 mb-5">
                  <div className="relative mx-auto w-28 h-28 rounded-full border-3 border-[#E8AF30] bg-[#FFF9EC] flex items-center justify-center shadow-inner overflow-hidden group-hover:scale-105 transition-transform duration-300">
                    {author2.pictureUrl ? (
                      <Image
                        src={author2.pictureUrl}
                        alt={author2.name}
                        width={112}
                        height={112}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Feather className="w-12 h-12 text-[#3B3028]/80 stroke-[1.5]" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-patrick text-3xl font-bold text-[#3B3028] group-hover:text-[#E8AF30] transition-colors">
                      <Link href={`/authors/${author2.slug}`}>
                        {author2.name}
                      </Link>
                    </h3>
                    <p className="text-xs sm:text-sm font-nunito font-semibold text-[#718B55] mt-1">
                      {author2.role || "Co-Curator & Author"}
                    </p>
                  </div>
                </div>

                <p className="font-nunito text-sm sm:text-base text-[#3B3028]/90 leading-relaxed text-center mb-6">
                  {author2.shortBio}
                </p>
              </div>

              <div className="pt-4 border-t border-[#EADBCE]/80 space-y-4">
                {author2.quote && (
                  <p className="font-kalam text-sm sm:text-base text-[#6B584C] italic text-center">
                    &ldquo;{author2.quote}&rdquo;
                  </p>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Link
                    href={`/authors/${author2.slug}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#FFF9EC] hover:bg-[#F4C542]/20 text-[#3B3028] border border-[#EADBCE] hover:border-[#E8AF30] font-patrick text-base font-bold transition-all duration-200 group/btn shadow-xs"
                  >
                    <BookOpen className="w-4 h-4 text-[#718B55]" />
                    <span>View Author Folio</span>
                    <ArrowRight className="w-4 h-4 text-[#E8AF30] group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative flex flex-col justify-between rounded-3xl border-2 border-dashed border-[#EADBCE] bg-[#FFF3D9]/40 p-8 shadow-xs">
              <div>
                <div className="flex items-center justify-between text-[#718B55] mb-6 pb-3 border-b border-[#EADBCE]/60">
                  <span className="font-patrick text-xs uppercase tracking-widest text-[#718B55] flex items-center gap-1.5 font-bold">
                    <SunMedium className="w-3.5 h-3.5 text-[#E8AF30]" />
                    The Second Writing Desk
                  </span>
                  <span className="text-xs font-nunito italic text-[#6B584C]">
                    Reserved Folio
                  </span>
                </div>

                <div className="text-center space-y-4 mb-5">
                  <div className="mx-auto w-28 h-28 rounded-full border-2 border-dashed border-[#E8AF30]/70 bg-[#FFF9EC] flex items-center justify-center shadow-inner">
                    <Feather className="w-10 h-10 text-[#6B584C]/50 stroke-[1.5]" />
                  </div>

                  <div>
                    <h3 className="font-patrick text-2xl sm:text-3xl font-bold text-[#6B584C]">
                      The Second Desk
                    </h3>
                    <p className="text-xs sm:text-sm font-nunito text-[#718B55] mt-1 font-semibold">
                      Reserved for Co-Curator
                    </p>
                  </div>
                </div>

                <p className="font-nunito text-sm text-[#6B584C] leading-relaxed text-center mb-6 max-w-sm mx-auto">
                  Sunflower Reverie is crafted for two authors. This desk is quietly awaiting our second co-curator to arrive beneath the afternoon sun.
                </p>
              </div>

              <div className="pt-4 border-t border-[#EADBCE]/60 text-center">
                <p className="font-kalam text-sm text-[#6B584C] italic">
                  &ldquo;Every garden has a second seat prepared for the afternoon light.&rdquo;
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Global About Link */}
        <div className="text-center mt-12 pt-6">
          <Link
            href="/about"
            className="inline-flex items-center gap-2 font-patrick text-lg text-[#3B3028] hover:text-[#E8AF30] border-b border-[#E8AF30] pb-0.5 transition-colors"
          >
            <span>Read more about Sunflower Reverie &amp; the Sanctuary Vision</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
