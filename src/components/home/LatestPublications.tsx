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

const FALLBACK_PUBLICATIONS: DisplayItem[] = [
  {
    id: "pub-1",
    title: "The Geometry of Morning Light",
    date: "October 24, 2026",
    category: "Blogs",
    summary:
      "There is an exact hour between dusk and daybreak when the sun casts long, honey-colored rectangles across the oak floor. Here lies the beginning of the writing day.",
    href: "/blogs/geometry-of-morning-light",
    isSample: true,
    authorName: "Author One",
    authorSlug: "author-one",
  },
  {
    id: "pub-2",
    title: "Petals in the West Wind",
    date: "October 08, 2026",
    category: "Poetry",
    summary:
      "One by one they loose their hold, drifting across the quiet loam. An elegiac verse celebrating the peaceful surrender of autumn.",
    href: "/poetry/petals-in-the-west-wind",
    isSample: true,
    authorName: "Author Two",
    authorSlug: "author-two",
  },
  {
    id: "pub-3",
    title: "Letter to a Young Gardener",
    date: "October 20, 2026",
    category: "Writings",
    summary:
      "On the courage required to plant seeds whose harvest you may never witness. A personal epistolary letter from the writing cabinet.",
    href: "/writings/letter-to-a-young-gardener",
    isSample: true,
    authorName: "Author One",
    authorSlug: "author-one",
  },
];

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
            authorSlug: p.author?.slug || "author-one",
          };
        })
      : FALLBACK_PUBLICATIONS;

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
              Continuous streams of thought and verse from our two co-curators.
            </p>
          </div>

          <div className="text-xs text-[#718B55] font-patrick uppercase tracking-wider bg-[#FFF3D9] px-3.5 py-1.5 rounded-full border border-[#EADBCE] self-start sm:self-auto">
            {latest && latest.length > 0 ? "Sanity Live Feed" : "CMS Feed Ready"}
          </div>
        </div>

        {/* List Layout with Classical Borders */}
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

                  <span className="flex items-center gap-1 text-[#6B584C] font-nunito font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    {pub.date}
                  </span>
                  <span className="text-[#6B584C] font-nunito italic">
                    {pub.isSample ? "• Sample Post" : "• Published Work"}
                  </span>
                </div>

                {/* Title in Patrick Hand */}
                <h3 className="font-patrick text-2xl sm:text-3xl font-bold text-[#3B3028] group-hover:text-[#E8AF30] transition-colors">
                  <Link href={pub.href} className="focus:outline-hidden">
                    {pub.title}
                  </Link>
                </h3>

                {/* Summary in Nunito */}
                <p className="font-nunito text-base text-[#3B3028]/85 leading-relaxed pt-1">
                  {pub.summary}
                </p>
              </div>

              <div className="shrink-0">
                <Link
                  href={pub.href}
                  className="inline-flex items-center gap-1.5 text-base font-patrick font-bold text-[#3B3028] group-hover:text-[#E8AF30] transition-colors"
                >
                  <span>Read Post</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
