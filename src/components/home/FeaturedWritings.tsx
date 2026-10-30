import Link from "next/link";
import { ArrowUpRight, BookOpen, Clock, Feather, Tag } from "lucide-react";
import { Container } from "@/components/common/Container";
import { Publication } from "@/types";

interface FeaturedPiece {
  id: string;
  title: string;
  category: string;
  readTime: string;
  excerpt: string;
  date: string;
  href: string;
  isSample?: boolean;
  authorName?: string;
  authorSlug?: string;
}

const FALLBACK_FEATURED_PIECES: FeaturedPiece[] = [
  {
    id: "piece-1",
    title: "The Geometry of Morning Light",
    category: "Blogs",
    readTime: "5 min read",
    date: "October 2026",
    excerpt:
      "There is an exact hour between dusk and daybreak when the sun casts long, honey-colored rectangles across the oak floor. Here lies the true beginning of the writing day...",
    href: "/blogs/geometry-of-morning-light",
    isSample: true,
    authorName: "Author One",
    authorSlug: "author-one",
  },
  {
    id: "piece-2",
    title: "Hymn to the August Sun",
    category: "Poetry",
    readTime: "2 min read",
    date: "October 2026",
    excerpt:
      "Golden monarch of the noon, turn our faces from the clay; teach our heavy hearts to bloom in the bright unhurried day...",
    href: "/poetry/hymn-to-the-august-sun",
    isSample: true,
    authorName: "Author Two",
    authorSlug: "author-two",
  },
  {
    id: "piece-3",
    title: "October 28: The First Crisp Frost",
    category: "Journal",
    readTime: "3 min read",
    date: "October 2026",
    excerpt:
      "Awoke to glass-like crystals rimming every leaf. The garden smells of cold cedar and rich wet earth. A morning that sharpens both the pencil and the spirit...",
    href: "/journal/october-28-the-first-crisp-frost",
    isSample: true,
    authorName: "Author One",
    authorSlug: "author-one",
  },
];

interface FeaturedWritingsProps {
  featured?: Publication[];
}

export function FeaturedWritings({ featured }: FeaturedWritingsProps) {
  const pieces: FeaturedPiece[] =
    featured && featured.length > 0
      ? featured.map((p) => {
          const catPath = p.type === "writing" ? "writings" : p.type;
          return {
            id: p.id,
            title: p.title,
            category: p.type.toUpperCase(),
            readTime: p.readingTime || "4 min read",
            date: p.date,
            excerpt: p.excerpt,
            href: `/${catPath}/${p.slug}`,
            isSample: p.isSampleContent,
            authorName: p.author?.name || "Author",
            authorSlug: p.author?.slug || "author-one",
          };
        })
      : FALLBACK_FEATURED_PIECES;

  return (
    <section className="py-20 sm:py-28 bg-[#FFF3D9]/40 border-b border-[#EADBCE]/60">
      <Container className="max-w-6xl">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFF3D9] border border-[#EADBCE] text-xs uppercase tracking-widest text-[#718B55] font-patrick">
              <Tag className="w-3.5 h-3.5 text-[#E8AF30]" />
              <span>Section 2 • Curated Selections</span>
            </div>
            {/* Caveat Section Heading */}
            <h2 className="font-caveat text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#3B3028] leading-[1.05]">
              Featured Writings
            </h2>
            <p className="font-nunito text-base sm:text-lg text-[#6B584C]">
              Carefully chosen reflections, poetic verses, and literary essays from both authors.
            </p>
          </div>

          <Link
            href="/writings"
            className="inline-flex items-center gap-2 text-base font-patrick font-bold text-[#3B3028] hover:text-[#E8AF30] transition-colors self-start md:self-end pb-1 border-b border-[#E8AF30]"
          >
            <span>View Complete Archive</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pieces.map((piece) => (
            <article
              key={piece.id}
              className="group relative flex flex-col justify-between rounded-2xl bg-[#FFF9EC] border border-[#EADBCE] p-7 shadow-xs hover:shadow-md hover:border-[#E8AF30] transition-all duration-300"
            >
              <div>
                {/* Category & Status Marker */}
                <div className="flex items-center justify-between text-xs text-[#718B55] mb-3 font-patrick">
                  <span className="uppercase tracking-wider bg-[#FFF3D9] px-2.5 py-1 rounded-full border border-[#EADBCE]">
                    {piece.category}
                  </span>
                  <span className="text-xs text-[#6B584C] font-nunito italic">
                    {piece.isSample ? "Sample Piece" : "Featured Work"}
                  </span>
                </div>

                {/* Author Attribution Byline */}
                {piece.authorName && (
                  <div className="flex items-center gap-1.5 text-xs text-[#6B584C] font-nunito mb-2.5">
                    <Feather className="w-3 h-3 text-[#E8AF30]" />
                    <span>Penned by</span>
                    {piece.authorSlug ? (
                      <Link
                        href={`/authors/${piece.authorSlug}`}
                        className="font-semibold text-[#3B3028] hover:text-[#E8AF30] underline-offset-2 hover:underline"
                      >
                        {piece.authorName}
                      </Link>
                    ) : (
                      <span className="font-semibold text-[#3B3028]">{piece.authorName}</span>
                    )}
                  </div>
                )}

                {/* Card Title in Patrick Hand */}
                <h3 className="font-patrick text-2xl font-bold text-[#3B3028] group-hover:text-[#E8AF30] transition-colors leading-snug mb-3">
                  <Link href={piece.href} className="focus:outline-hidden">
                    {piece.title}
                  </Link>
                </h3>

                {/* Excerpt in Nunito */}
                <p className="font-nunito text-[#3B3028]/85 text-base leading-relaxed line-clamp-3 mb-6">
                  {piece.excerpt}
                </p>
              </div>

              {/* Card Meta & Action */}
              <div className="pt-4 border-t border-[#EADBCE]/70 flex items-center justify-between text-xs text-[#6B584C]">
                <span className="flex items-center gap-1.5 font-nunito font-semibold">
                  <Clock className="w-3.5 h-3.5 text-[#718B55]" />
                  {piece.readTime}
                </span>

                <Link
                  href={piece.href}
                  className="font-patrick text-base font-bold text-[#3B3028] group-hover:text-[#E8AF30] flex items-center gap-1 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Read Piece</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
