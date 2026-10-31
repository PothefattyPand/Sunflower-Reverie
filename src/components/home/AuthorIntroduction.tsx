import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Feather, Sparkles, BookOpen } from "lucide-react";
import { Container } from "@/components/common/Container";
import { AuthorProfile } from "@/types";

interface AuthorIntroductionProps {
  authors?: AuthorProfile[];
}

export function AuthorIntroduction({ authors = [] }: AuthorIntroductionProps) {
  const author = authors.length > 0 ? authors[0] : null;

  return (
    <section className="py-20 sm:py-28 bg-[#FFF9EC] border-b border-[#EADBCE]/60">
      <Container className="max-w-4xl">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFF3D9] border border-[#EADBCE] text-xs font-patrick uppercase tracking-widest text-[#718B55]">
            <Sparkles className="w-3.5 h-3.5 text-[#E8AF30]" />
            <span>
              {author ? "Section 1 • Sanctuary Curator" : "Section 1 • The Sanctuary Hearth"}
            </span>
          </div>

          <h2 className="font-caveat text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#3B3028] leading-[1.05]">
            {author ? "Meet Our Author" : "The Living Writing Desk"}
          </h2>

          <p className="font-nunito text-base sm:text-lg text-[#6B584C] leading-relaxed">
            {author
              ? "Sunflower Reverie is tended from a quiet literary sanctuary beneath the open sky, gathering unhurried reflections, poetic verses, and personal journals."
              : "Sunflower Reverie is an unhurried digital sanctuary where poetry, contemplative essays, and morning reflections bloom beneath the open sky."}
          </p>
        </div>

        {/* Public Author Card (When visible author is configured) */}
        {author ? (
          <div className="max-w-xl mx-auto rounded-3xl border-2 border-[#EADBCE] bg-[#FFF3D9]/80 hover:bg-[#FFF3D9] p-8 sm:p-10 shadow-xs hover:shadow-md hover:border-[#E8AF30] transition-all duration-300">
            <div>
              {/* Botanical card header badge */}
              <div className="flex items-center justify-between text-[#718B55] mb-6 pb-3 border-b border-[#EADBCE]/80">
                <span className="font-patrick text-xs uppercase tracking-widest text-[#6B584C] flex items-center gap-1.5 font-bold">
                  <Feather className="w-3.5 h-3.5 text-[#E8AF30]" />
                  Sanctuary Curator
                </span>
                <span className="text-xs font-nunito italic text-[#6B584C]">
                  Sunflower Folio
                </span>
              </div>

              {/* Portrait circle */}
              <div className="text-center space-y-4 mb-5">
                <div className="relative mx-auto w-28 h-28 sm:w-32 sm:h-32 rounded-full border-3 border-[#E8AF30] bg-[#FFF9EC] flex items-center justify-center shadow-inner overflow-hidden group-hover:scale-105 transition-transform duration-300">
                  {author.pictureUrl ? (
                    <Image
                      src={author.pictureUrl}
                      alt={author.name}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Feather className="w-12 h-12 text-[#3B3028]/80 stroke-[1.5]" />
                  )}
                </div>

                <div>
                  <h3 className="font-patrick text-3xl sm:text-4xl font-bold text-[#3B3028] hover:text-[#E8AF30] transition-colors">
                    <Link href={`/authors/${author.slug}`}>
                      {author.name}
                    </Link>
                  </h3>
                  <p className="text-xs sm:text-sm font-nunito font-semibold text-[#718B55] mt-1">
                    {author.role || "Curator & Author"}
                  </p>
                </div>
              </div>

              {/* Short Bio */}
              <p className="font-nunito text-sm sm:text-base text-[#3B3028]/90 leading-relaxed text-center mb-6">
                {author.shortBio || "Dedicated to quiet morning reflections, classical nature poetry, and the unhurried craft of contemplative prose."}
              </p>
            </div>

            {/* Footer Quote & Action */}
            <div className="pt-4 border-t border-[#EADBCE]/80 space-y-4">
              {author.quote && (
                <p className="font-kalam text-sm sm:text-base text-[#6B584C] italic text-center">
                  &ldquo;{author.quote}&rdquo;
                </p>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  href={`/authors/${author.slug}`}
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
          /* Elegant Generic Literary Introduction (When no visible author has been configured yet) */
          <div className="max-w-xl mx-auto rounded-3xl border-2 border-[#EADBCE] bg-[#FFF3D9]/80 hover:bg-[#FFF3D9] p-8 sm:p-10 shadow-xs hover:shadow-md hover:border-[#E8AF30] transition-all duration-300">
            <div>
              {/* Botanical card header badge */}
              <div className="flex items-center justify-between text-[#718B55] mb-6 pb-3 border-b border-[#EADBCE]/80">
                <span className="font-patrick text-xs uppercase tracking-widest text-[#6B584C] flex items-center gap-1.5 font-bold">
                  <Feather className="w-3.5 h-3.5 text-[#E8AF30]" />
                  The Literary Sanctuary
                </span>
                <span className="text-xs font-nunito italic text-[#6B584C]">
                  Sunflower Reverie
                </span>
              </div>

              {/* Botanical Center Emblem */}
              <div className="text-center space-y-4 mb-5">
                <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 rounded-full border-3 border-[#E8AF30] bg-[#FFF9EC] flex items-center justify-center shadow-inner overflow-hidden group-hover:scale-105 transition-transform duration-300">
                  <Feather className="w-12 h-12 text-[#E8AF30] stroke-[1.5]" />
                </div>

                <div>
                  <h3 className="font-patrick text-3xl sm:text-4xl font-bold text-[#3B3028]">
                    Words Tended in Quietude
                  </h3>
                  <p className="text-xs sm:text-sm font-nunito font-semibold text-[#718B55] mt-1">
                    Contemplative Prose, Poetry &amp; Field Notes
                  </p>
                </div>
              </div>

              {/* Sanctuary Description */}
              <p className="font-nunito text-sm sm:text-base text-[#3B3028]/90 leading-relaxed text-center mb-6">
                Sunflower Reverie is kept as a peaceful, unhurried hearth for language. Here, reflective essays, nature poetry, and morning thoughts are gathered beneath the open sky and offered freely to readers seeking warmth and stillness.
              </p>
            </div>

            {/* Footer Quote & Action */}
            <div className="pt-4 border-t border-[#EADBCE]/80 space-y-4">
              <p className="font-kalam text-sm sm:text-base text-[#6B584C] italic text-center">
                &ldquo;Every sentence is a flower turned quietly toward the morning light.&rdquo;
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  href="/writings"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#FFF9EC] hover:bg-[#F4C542]/20 text-[#3B3028] border border-[#EADBCE] hover:border-[#E8AF30] font-patrick text-base font-bold transition-all duration-200 group/btn shadow-xs"
                >
                  <BookOpen className="w-4 h-4 text-[#718B55]" />
                  <span>Explore Sanctuary Writings</span>
                  <ArrowRight className="w-4 h-4 text-[#E8AF30] group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        )}

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
