import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  fetchPublicationBySlug,
  fetchPublicationsByCategory,
  getRelatedPublications,
} from "@/data/publications";
import { PublicationLayout } from "@/components/reading/PublicationLayout";
import { getBaseUrl } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await fetchPublicationBySlug("journal", slug);

  if (!entry) {
    return {
      title: "Entry Not Found | Sunflower Reverie",
    };
  }

  const title = entry.seoTitle || entry.title;
  const description = entry.seoDescription || entry.excerpt;
  const canonicalUrl = `${getBaseUrl()}/journal/${entry.slug}`;
  const ogImages = entry.coverImage?.src
    ? [{ url: entry.coverImage.src, alt: entry.coverImage.alt }]
    : undefined;

  return {
    title: `${title} | Pages of Reflection`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | Sunflower Reverie`,
      description,
      url: canonicalUrl,
      type: "article",
      publishedTime: entry.isoDate,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Sunflower Reverie`,
      description,
      images: ogImages ? [ogImages[0].url] : undefined,
    },
  };
}

export default async function JournalEntryPage({ params }: PageProps) {
  const { slug } = await params;
  const entry = await fetchPublicationBySlug("journal", slug);

  if (!entry) {
    notFound();
  }

  const allEntries = await fetchPublicationsByCategory("journal");
  const related = getRelatedPublications(entry.id, "journal", 3, allEntries);

  return (
    <PublicationLayout
      publication={entry}
      related={related}
      backHref="/journal"
      backLabel="Back to Pages of Reflection"
    />
  );
}
