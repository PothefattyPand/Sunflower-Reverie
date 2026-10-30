import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, Clock, Feather, Sparkles, Tag } from "lucide-react";
import { Container } from "@/components/common/Container";
import { Publication } from "@/types";
import { ShareButton } from "./ShareButton";
import { BotanicalDivider } from "./BotanicalDivider";
import { PoetryReader } from "./PoetryReader";
import { RelatedWritings } from "./RelatedWritings";

interface PublicationLayoutProps {
  publication: Publication;
  related: Publication[];
  backHref: string;
  backLabel: string;
}

function isOptimizableImage(src: string): boolean {
  if (!src) return false;
  if (src.startsWith("/")) return true;
  try {
    const url = new URL(src);
    return (
      url.hostname === "shxitgbxfestrbhdukku.supabase.co" ||
      url.hostname === "images.unsplash.com"
    );
  } catch {
    return false;
  }
}

function renderContentParagraph(paragraph: string, index: number, publicationTitle: string) {
  // Check if paragraph is purely a standalone markdown image: ![alt](url)
  const standaloneMatch = paragraph.trim().match(/^!\[(.*?)\]\((https?:\/\/[^\s\)]+)\)$/);
  if (standaloneMatch) {
    const [, altText, src] = standaloneMatch;
    const isOptimized = isOptimizableImage(src);
    return (
      <figure
        key={index}
        className="my-8 rounded-2xl overflow-hidden border border-[#EADBCE] bg-[#FFF3D9]/60 p-4 sm:p-6 text-center shadow-xs"
      >
        <div className="relative w-full aspect-[16/9] max-h-[500px] overflow-hidden rounded-xl mb-3 shadow-xs">
          <Image
            src={src}
            alt={altText || publicationTitle}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 768px, 800px"
            className="object-cover"
            loading="lazy"
            unoptimized={!isOptimized}
          />
        </div>
        {altText && (
          <figcaption className="font-kalam text-sm sm:text-base text-[#6B584C] italic">
            {altText}
          </figcaption>
        )}
      </figure>
    );
  }

  // Check if paragraph contains markdown images mixed with text
  const parts = paragraph.split(/(!\[.*?\]\(https?:\/\/[^\s\)]+\))/g);
  if (parts.length > 1) {
    return (
      <div key={index} className="space-y-4">
        {parts.map((part, pIdx) => {
          const imgMatch = part.match(/^!\[(.*?)\]\((https?:\/\/[^\s\)]+)\)$/);
          if (imgMatch) {
            const [, altText, src] = imgMatch;
            const isOptimized = isOptimizableImage(src);
            return (
              <figure
                key={pIdx}
                className="my-6 rounded-2xl overflow-hidden border border-[#EADBCE] bg-[#FFF3D9]/60 p-4 text-center shadow-xs"
              >
                <div className="relative w-full aspect-[16/9] max-h-[450px] overflow-hidden rounded-xl mb-2 shadow-xs">
                  <Image
                    src={src}
                    alt={altText || publicationTitle}
                    fill
                    sizes="(max-width: 768px) 100vw, 800px"
                    className="object-cover"
                    loading="lazy"
                    unoptimized={!isOptimized}
                  />
                </div>
                {altText && (
                  <figcaption className="font-kalam text-xs sm:text-sm text-[#6B584C] italic">
                    {altText}
                  </figcaption>
                )}
              </figure>
            );
          }
          if (!part.trim()) return null;
          return (
            <p key={pIdx} className="leading-relaxed">
              {part}
            </p>
          );
        })}
      </div>
    );
  }

  // Standard prose paragraph
  return (
    <p key={index} className="leading-relaxed">
      {paragraph}
    </p>
  );
}

export function PublicationLayout({
  publication,
  related,
  backHref,
  backLabel,
}: PublicationLayoutProps) {
  const isPoetry = publication.type === "poetry";
  const isCoverOptimized = publication.coverImage?.src
    ? isOptimizableImage(publication.coverImage.src)
    : false;

  return (
    <article className="py-12 sm:py-20 bg-[#FFF9EC] text-[#3B3028]">
      <Container className="max-w-3xl">
        {/* Navigation & Share Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 sm:mb-12 pb-4 border-b border-[#EADBCE]">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-base font-patrick font-semibold text-[#6B584C] hover:text-[#3B3028] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 text-[#E8AF30] group-hover:-translate-x-1 transition-transform" />
            <span>{backLabel}</span>
          </Link>

          <ShareButton title={publication.title} />
        </div>

        {/* Header Metadata */}
        <header className="space-y-4 mb-10 text-center">
          {/* Eyebrow & Category Tag */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-[#718B55] font-nunito">
            <span className="px-3 py-1 rounded-full bg-[#FFF3D9] border border-[#EADBCE]">
              {publication.writingSubtype
                ? publication.writingSubtype.replace("-", " ")
                : publication.type}
            </span>
            <span className="text-[#EADBCE]">•</span>
            <span className="flex items-center gap-1.5 font-nunito">
              <Calendar className="w-3.5 h-3.5 text-[#E8AF30]" />
              <time dateTime={publication.isoDate}>{publication.date}</time>
            </span>
            {publication.readingTime && (
              <>
                <span className="text-[#EADBCE]">•</span>
                <span className="flex items-center gap-1 font-nunito">
                  <Clock className="w-3.5 h-3.5 text-[#718B55]" />
                  {publication.readingTime}
                </span>
              </>
            )}
          </div>

          {/* Publication Title - Handwritten Caveat */}
          <h1 className="font-caveat text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#3B3028] leading-[1.15]">
            {publication.title}
          </h1>

          {/* Optional Subtitle - Kalam */}
          {publication.subtitle && (
            <p className="font-kalam text-xl sm:text-2xl text-[#6B584C] font-semibold max-w-2xl mx-auto">
              {publication.subtitle}
            </p>
          )}

          {/* Author Attribution Byline */}
          {publication.author && (
            <div className="pt-2 flex items-center justify-center gap-2">
              <span className="text-sm font-nunito text-[#6B584C]">Penned by</span>
              <Link
                href={`/authors/${publication.author.slug}`}
                className="inline-flex items-center gap-1.5 font-patrick text-lg font-bold text-[#3B3028] hover:text-[#E8AF30] underline-offset-4 hover:underline transition-colors"
              >
                <Feather className="w-4 h-4 text-[#E8AF30]" />
                <span>{publication.author.name}</span>
              </Link>
            </div>
          )}

          {/* Published Sanctuary Badge */}
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-nunito text-[#6B584C] bg-[#FFF3D9]/60 px-3 py-1 rounded-full border border-[#EADBCE]/70">
              <Sparkles className="w-3 h-3 text-[#E8AF30]" />
              {publication.isSampleContent ? "Sample Folio • Tended with Warmth" : "Published Piece • Sunflower Reverie"}
            </span>
          </div>
        </header>

        {/* Optional Cover Image / Botanical Framing */}
        {publication.coverImage && (
          <figure className="my-8 rounded-2xl overflow-hidden border border-[#EADBCE] bg-[#FFF3D9]/60 p-4 sm:p-6 text-center">
            {publication.coverImage.src ? (
              <div className="relative w-full aspect-[16/9] max-h-[500px] overflow-hidden rounded-xl mb-3 shadow-xs">
                <Image
                  src={publication.coverImage.src}
                  alt={publication.coverImage.alt || publication.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 768px, 800px"
                  className="object-cover"
                  priority
                  unoptimized={!isCoverOptimized}
                />
              </div>
            ) : (
              <div className="w-16 h-16 mx-auto rounded-full bg-[#FFF9EC] border border-[#E8AF30] flex items-center justify-center mb-3">
                <Feather className="w-8 h-8 text-[#3B3028]" />
              </div>
            )}
            {(publication.coverImage.caption || publication.coverImage.alt) && (
              <figcaption className="font-kalam text-base text-[#6B584C]">
                {publication.coverImage.caption || publication.coverImage.alt}
              </figcaption>
            )}
          </figure>
        )}

        <BotanicalDivider className="my-8" />

        {/* Main Content Area */}
        {isPoetry ? (
          <PoetryReader stanzas={publication.stanzas} body={publication.body} />
        ) : (
          <div className="prose prose-stone max-w-none space-y-6 text-lg sm:text-xl leading-relaxed text-[#3B3028]/95 font-nunito">
            {publication.body.map((paragraph, index) =>
              renderContentParagraph(paragraph, index, publication.title)
            )}
          </div>
        )}

        {/* Tags */}
        {publication.tags && publication.tags.length > 0 && (
          <div className="mt-12 pt-6 border-t border-[#EADBCE] flex flex-wrap items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-[#E8AF30]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#718B55] mr-1 font-nunito">
              Themes:
            </span>
            {publication.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-full bg-[#FFF3D9] border border-[#EADBCE] text-xs text-[#6B584C] font-nunito font-semibold"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Author Byline Box */}
        {publication.author && (
          <div className="my-12 p-6 sm:p-8 rounded-2xl bg-[#FFF3D9]/60 border border-[#EADBCE] flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <div className="relative w-16 h-16 rounded-full border-2 border-[#E8AF30] bg-[#FFF9EC] flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
              {publication.author.pictureUrl ? (
                <Image
                  src={publication.author.pictureUrl}
                  alt={publication.author.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  unoptimized={!isOptimizableImage(publication.author.pictureUrl)}
                />
              ) : (
                <Feather className="w-7 h-7 text-[#3B3028]/80 stroke-[1.5]" />
              )}
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <h3 className="font-patrick text-xl font-bold text-[#3B3028]">
                  About {publication.author.name}
                </h3>
                <Link
                  href={`/authors/${publication.author.slug}`}
                  className="font-patrick text-base font-bold text-[#E8AF30] hover:text-[#3B3028] transition-colors"
                >
                  View Complete Folio &rarr;
                </Link>
              </div>
              <p className="text-xs font-nunito text-[#718B55] font-semibold">
                {publication.author.role || "Co-Curator of Sunflower Reverie"}
              </p>
              <p className="text-sm text-[#6B584C] font-nunito leading-relaxed">
                Writing from the quiet perimeter of Sunflower Reverie, sharing unhurried observations, poetic verses, and personal journals beneath the open sky.
              </p>
            </div>
          </div>
        )}

        {/* Related Works */}
        <RelatedWritings publications={related} currentType={publication.type} />
      </Container>
    </article>
  );
}
