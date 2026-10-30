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
  const item = await fetchPublicationBySlug("writing", slug);

  if (!item) {
    return {
      title: "Work Not Found | Sunflower Reverie",
    };
  }

  const title = item.seoTitle || item.title;
  const description = item.seoDescription || item.excerpt;
  const canonicalUrl = `${getBaseUrl()}/writings/${item.slug}`;
  const ogImages = item.coverImage?.src
    ? [{ url: item.coverImage.src, alt: item.coverImage.alt }]
    : undefined;

  return {
    title: `${title} | Letters & Other Words`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | Sunflower Reverie`,
      description,
      url: canonicalUrl,
      type: "article",
      publishedTime: item.isoDate,
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

export default async function WritingDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = await fetchPublicationBySlug("writing", slug);

  if (!item) {
    notFound();
  }

  const allWritings = await fetchPublicationsByCategory("writing");
  const related = getRelatedPublications(item.id, "writing", 3, allWritings);

  return (
    <PublicationLayout
      publication={item}
      related={related}
      backHref="/writings"
      backLabel="Back to Letters & Other Words"
    />
  );
}
