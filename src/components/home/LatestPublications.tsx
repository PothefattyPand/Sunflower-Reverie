import Link from "next/link";
import { ArrowRight, Calendar, Feather, Sparkles } from "lucide-react";
import { Container } from "@/components/common/Container";
import { Publication } from "@/types";

interface DisplayItem {
  id: string;
  title: string;
  date: string;
  category: string;
  summary: string;
  href: string;
  isSample?: boolean;
  authorName?: string;
  authorSlug?: string;
}

interface LatestPublicationsProps {
  latest?: Publication[];
}

export function LatestPublications({ latest }: LatestPublicationsProps) {
  const items: DisplayItem[] =
    latest && latest.length > 0
      ? latest.map((p) => {
          const catPath = p.type === "writing" ? "writings" : p.type;
          return {
            id: p.id,
            title: p.title,
            date: p.date,
            category: p.type.toUpperCase(),
            summary: p.excerpt,
            href: `/${catPath}/${p.slug}`,
            isSample: p.isSampleContent,
            authorName: p.author?.name || "Author",
            authorSlug: (p.isAnonymous ? undefined : p.author?.slug) || undefined,
          };
        })
      : [];

  return (
    <section className="py-20 sm:py-28 bg-[#FFF9EC] border-b border-[#EADBCE]/60">
      <Container className="max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 sm:mb-16 gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFF3D9] border border-[#EADBCE] text-xs uppercase tracking-widest text-[#718B55] font-patrick">
              <Sparkles className="w-3.5 h-3.5 text-[#E8AF30]" />
              <span>Section 5 • Fresh Dispatches</span>
            </div>
            {/* Caveat Section Heading */}
            <h2 className="font-caveat text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#3B3028] leading-[1.05]">
              Latest Publications
            </h2>
            <p className="font-nunito text-base text-[#6B584C]">
              Continuous streams of thought and verse from our literary sanctuary.
            </p>
          </div>

          <div className="text-xs text-[#718B55] font-patrick uppercase tracking-wider bg-[#FFF3D9] px-3.5 py-1.5 rounded-full border border-[#EADBCE] self-start sm:self-auto">
            {items.length > 0 ? "Fresh Folio Dispatches" : "Sanctuary Stream"}
          </div>
        </div>

        {/* List Layout with Classical Borders or Sunflower Empty State */}
        {items.length === 0 ? (
          <div className="text-center py-16 px-6 rounded-3xl bg-[#FFF3D9]/50 border-2 border-dashed border-[#EADBCE] space-y-4 max-w-xl mx-auto">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#FFF9EC] border border-[#E8AF30] flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-[#E8AF30]" />
            </div>
            <h3 className="font-caveat text-3xl sm:text-4xl font-bold text-[#3B3028]">
              Fresh pages are being penned at the writing desk.
            </h3>
            <p className="font-nunito text-base text-[#6B584C] leading-relaxed">
              New reflections, poems, and journal entries will appear in this dispatch stream as new writings are published.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#EADBCE]">
            {items.map((pub) => (
              <article
                key={pub.id}
                className="py-8 sm:py-10 group flex flex-col md:flex-row md:items-baseline justify-between gap-6 transition-colors"
              >
                <div className="space-y-2 md:max-w-2xl">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#718B55] mb-2 font-patrick">
                    <span className="uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#FFF3D9] border border-[#EADBCE]">
                      {pub.category}
                    </span>

                    {pub.authorName && (
                      <span className="flex items-center gap-1 text-[#6B584C] font-nunito">
                        <Feather className="w-3 h-3 text-[#E8AF30]" />
                        <span>by</span>
                        {pub.authorSlug ? (
                          <Link
                            href={`/authors/${pub.authorSlug}`}
                            className="font-semibold text-[#3B3028] hover:text-[#E8AF30] underline-offset-2 hover:underline"
                          >
                            {pub.authorName}
                          </Link>
                        ) : (
                          <span className="font-semibold text-[#3B3028]">{pub.authorName}</span>
                        )}
                      </span>
                    )}

                    <span className="flex items-center gap-1 text-[#6B584C] font-nunito">
                      <Calendar className="w-3 h-3 text-[#E8AF30]" />
                      <time>{pub.date}</time>
                    </span>

                    {pub.isSample && (
                      <span className="italic text-[#6B584C] text-[11px] font-nunito">
                        • Demo Dispatch
                      </span>
                    )}
                  </div>

                  {/* Patrick Hand Title */}
                  <h3 className="font-patrick text-2xl sm:text-3xl font-bold text-[#3B3028] group-hover:text-[#E8AF30] transition-colors leading-snug">
                    <Link href={pub.href} className="focus:outline-hidden">
                      {pub.title}
                    </Link>
                  </h3>

                  {/* Nunito Summary */}
                  <p className="font-nunito text-[#3B3028]/85 text-base sm:text-lg leading-relaxed pt-1">
                    {pub.summary}
                  </p>
                </div>

                <div className="shrink-0 self-start md:self-center">
                  <Link
                    href={pub.href}
                    className="inline-flex items-center gap-2 font-patrick text-base font-bold text-[#3B3028] group-hover:text-[#E8AF30] px-4 py-2 rounded-full border border-[#EADBCE] bg-[#FFF3D9]/60 hover:bg-[#FFF3D9] transition-all"
                  >
                    <span>Read Dispatch</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
