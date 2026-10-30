import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Feather, Globe, Mail, Sparkles } from "lucide-react";
import { Container } from "@/components/common/Container";
import {
  fetchAllAuthorSlugs,
  fetchAuthorBySlug,
  fetchPublicationsByAuthor,
} from "@/data/publications";
import { AuthorPublicationsListing } from "@/components/authors/AuthorPublicationsListing";
import { getBaseUrl } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await fetchAllAuthorSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const author = await fetchAuthorBySlug(slug);

  if (!author) {
    return {
      title: "Author Not Found | Sunflower Reverie",
    };
  }

  const title = `${author.name} | Author Profile`;
  const description =
    author.shortBio ||
    `Explore literary writings, poetry, essays, and journals by ${author.name} on Sunflower Reverie.`;
  const canonicalUrl = `${getBaseUrl()}/authors/${author.slug}`;
  const ogImages = author.pictureUrl ? [{ url: author.pictureUrl, alt: author.name }] : undefined;

  return {
    title: `${title} | Sunflower Reverie`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | Sunflower Reverie`,
      description,
      url: canonicalUrl,
      type: "profile",
      images: ogImages,
    },
  };
}

export default async function AuthorProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const [author, publications] = await Promise.all([
    fetchAuthorBySlug(slug),
    fetchPublicationsByAuthor(slug),
  ]);

  if (!author) {
    notFound();
  }

  const hasPortrait = Boolean(author.pictureUrl);

  return (
    <div className="py-12 sm:py-20 bg-[#FFF9EC] text-[#3B3028]">
      <Container className="max-w-5xl">
        {/* Back Link */}
        <div className="mb-8 pb-4 border-b border-[#EADBCE]">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-base font-patrick font-semibold text-[#6B584C] hover:text-[#3B3028] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 text-[#E8AF30] group-hover:-translate-x-1 transition-transform" />
            <span>Return to Sunflower Reverie</span>
          </Link>
        </div>

        {/* Author Profile Hero Card */}
        <div className="relative rounded-3xl border-2 border-[#EADBCE] bg-[#FFF3D9]/70 p-8 sm:p-12 mb-16 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
            {/* Portrait Column */}
            <div className="md:col-span-4 flex flex-col items-center text-center">
              <div className="relative">
                <div className="absolute -inset-3 rounded-full bg-gradient-to-tr from-[#E8AF30]/20 via-[#FFF3D9] to-[#718B55]/20 blur-md" />
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full border-3 border-[#E8AF30] bg-[#FFF9EC] flex items-center justify-center shadow-inner overflow-hidden">
                  {hasPortrait && author.pictureUrl ? (
                    <Image
                      src={author.pictureUrl}
                      alt={author.name}
                      width={176}
                      height={176}
                      priority
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Feather className="w-16 h-16 text-[#3B3028]/80 stroke-[1.5]" />
                  )}
                </div>
              </div>

              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF9EC] border border-[#EADBCE] text-xs font-patrick text-[#718B55] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#E8AF30]" />
                <span>Sanctuary Co-Curator</span>
              </div>
            </div>

            {/* Author Information Column */}
            <div className="md:col-span-8 space-y-4 text-center md:text-left">
              <div>
                <h1 className="font-caveat text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#3B3028] leading-[1.05]">
                  {author.name}
                </h1>
                <p className="font-patrick text-xl text-[#718B55] font-semibold mt-1">
                  {author.role}
                </p>
              </div>

              {/* Quote in Kalam */}
              {author.quote && (
                <div className="py-2 border-y border-[#EADBCE]/80">
                  <p className="font-kalam text-lg sm:text-xl text-[#6B584C] italic">
                    &ldquo;{author.quote}&rdquo;
                  </p>
                </div>
              )}

              {/* Bio */}
              <div className="text-base sm:text-lg text-[#3B3028]/90 font-nunito leading-relaxed space-y-3">
                {author.shortBio && <p>{author.shortBio}</p>}

                {typeof author.fullBio === "string" && author.fullBio.length > 0 && (
                  <div className="pt-2 space-y-3 font-nunito text-base leading-relaxed text-[#3B3028]/90">
                    {author.fullBio.split(/\n\s*\n/).map((para: string, i: number) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                )}

                {Array.isArray(author.fullBio) && author.fullBio.length > 0 && (
                  <div className="pt-2 space-y-3 font-nunito text-base leading-relaxed text-[#3B3028]/90">
                    {author.fullBio.map((item, idx) => {
                      if (typeof item === "string") return <p key={idx}>{item}</p>;
                      if (item && typeof item === "object" && "children" in item) {
                        const text = (item.children as { text?: string }[]).map((c) => c.text || "").join("");
                        return <p key={idx}>{text}</p>;
                      }
                      return null;
                    })}
                  </div>
                )}
              </div>

              {/* Literary Themes / Writing Interests */}
              {author.interests && author.interests.length > 0 && (
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#718B55] font-nunito mr-1">
                    Themes:
                  </span>
                  {author.interests.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-[#FFF9EC] border border-[#EADBCE] text-xs font-patrick text-[#3B3028] font-bold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Social Links */}
              {author.socialLinks && author.socialLinks.length > 0 && (
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#718B55] font-nunito mr-1">
                    Connect:
                  </span>
                  {author.socialLinks
                    .filter((link): link is { platform: string; url: string } => Boolean(link.platform && link.url))
                    .map((link) => (
                      <a
                        key={link.platform}
                        href={link.url}
                        target={link.url.startsWith("http") ? "_blank" : undefined}
                        rel={link.url.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFF9EC] hover:bg-[#F4C542]/20 border border-[#EADBCE] hover:border-[#E8AF30] text-xs font-patrick font-bold text-[#3B3028] transition-colors"
                      >
                        {link.platform.toLowerCase() === "email" ? (
                          <Mail className="w-3.5 h-3.5 text-[#E8AF30]" />
                        ) : (
                          <Globe className="w-3.5 h-3.5 text-[#718B55]" />
                        )}
                        <span>{link.platform}</span>
                      </a>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Author Works Section */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-caveat text-4xl sm:text-5xl font-bold tracking-tight text-[#3B3028]">
              {author.name}&apos;s Folio
            </h2>
            <p className="font-nunito text-base text-[#6B584C]">
              Browse all essays, poetic verses, and personal journals published by {author.name}.
            </p>
          </div>

          <AuthorPublicationsListing
            initialPublications={publications}
            authorName={author.name}
          />
        </section>
      </Container>
    </div>
  );
}
