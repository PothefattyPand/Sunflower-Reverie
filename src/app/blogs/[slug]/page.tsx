import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  fetchCategorySlugs,
  fetchPublicationBySlug,
  fetchPublicationsByCategory,
  getRelatedPublications,
} from "@/data/publications";
import { PublicationLayout } from "@/components/reading/PublicationLayout";
import { getBaseUrl } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await fetchCategorySlugs("blog");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPublicationBySlug("blog", slug);

  if (!post) {
    return {
      title: "Thought Not Found | Sunflower Reverie",
    };
  }

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const canonicalUrl = `${getBaseUrl()}/blogs/${post.slug}`;
  const ogImages = post.coverImage?.src
    ? [{ url: post.coverImage.src, alt: post.coverImage.alt }]
    : undefined;

  return {
    title: `${title} | Thoughts Beneath the Sun`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | Sunflower Reverie`,
      description,
      url: canonicalUrl,
      type: "article",
      publishedTime: post.isoDate,
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

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await fetchPublicationBySlug("blog", slug);

  if (!post) {
    notFound();
  }

  const allBlogs = await fetchPublicationsByCategory("blog");
  const related = getRelatedPublications(post.id, "blog", 3, allBlogs);

  return (
    <PublicationLayout
      publication={post}
      related={related}
      backHref="/blogs"
      backLabel="Back to Thoughts Beneath the Sun"
    />
  );
}
