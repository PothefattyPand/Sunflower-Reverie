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
  const poem = await fetchPublicationBySlug("poetry", slug);

  if (!poem) {
    return {
      title: "Poem Not Found | Sunflower Reverie",
    };
  }

  const title = poem.seoTitle || poem.title;
  const description = poem.seoDescription || poem.excerpt.replace(/\n/g, " ");
  const canonicalUrl = `${getBaseUrl()}/poetry/${poem.slug}`;
  const ogImages = poem.coverImage?.src
    ? [{ url: poem.coverImage.src, alt: poem.coverImage.alt }]
    : undefined;

  return {
    title: `${title} | Verses in Bloom`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | Sunflower Reverie`,
      description,
      url: canonicalUrl,
      type: "article",
      publishedTime: poem.isoDate,
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

export default async function PoemPage({ params }: PageProps) {
  const { slug } = await params;
  const poem = await fetchPublicationBySlug("poetry", slug);

  if (!poem) {
    notFound();
  }

  const allPoems = await fetchPublicationsByCategory("poetry");
  const related = getRelatedPublications(poem.id, "poetry", 3, allPoems);

  return (
    <PublicationLayout
      publication={poem}
      related={related}
      backHref="/poetry"
      backLabel="Back to Verses in Bloom"
    />
  );
}
