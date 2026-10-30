import { groq } from "next-sanity";

/**
 * GROQ Queries for Sunflower Reverie
 * All public queries strictly filter out draft documents (!(_id in path('drafts.**'))).
 */

const authorProjection = `
  author->{
    _id,
    name,
    "slug": slug.current,
    role,
    picture
  }
`;

export const allPublicationsQuery = groq`
  *[_type == "publication" && !(_id in path('drafts.**'))] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    category,
    writingSubtype,
    subtitle,
    excerpt,
    body,
    poetryStanzas,
    coverImage,
    imageAlt,
    publishedAt,
    readingTime,
    tags,
    featured,
    ${authorProjection}
  }
`;

export const publicationsByCategoryQuery = groq`
  *[_type == "publication" && category == $category && !(_id in path('drafts.**'))] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    category,
    writingSubtype,
    subtitle,
    excerpt,
    body,
    poetryStanzas,
    coverImage,
    imageAlt,
    publishedAt,
    readingTime,
    tags,
    featured,
    ${authorProjection}
  }
`;

export const publicationBySlugQuery = groq`
  *[_type == "publication" && category == $category && slug.current == $slug && !(_id in path('drafts.**'))][0] {
    _id,
    title,
    "slug": slug.current,
    category,
    writingSubtype,
    subtitle,
    excerpt,
    body,
    poetryStanzas,
    coverImage,
    imageAlt,
    publishedAt,
    readingTime,
    tags,
    featured,
    seoTitle,
    seoDescription,
    ${authorProjection}
  }
`;

export const publicationsByAuthorSlugQuery = groq`
  *[_type == "publication" && author->slug.current == $authorSlug && !(_id in path('drafts.**'))] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    category,
    writingSubtype,
    subtitle,
    excerpt,
    body,
    poetryStanzas,
    coverImage,
    imageAlt,
    publishedAt,
    readingTime,
    tags,
    featured,
    ${authorProjection}
  }
`;

export const featuredPublicationsQuery = groq`
  *[_type == "publication" && featured == true && !(_id in path('drafts.**'))] | order(publishedAt desc)[0...3] {
    _id,
    title,
    "slug": slug.current,
    category,
    writingSubtype,
    subtitle,
    excerpt,
    coverImage,
    imageAlt,
    publishedAt,
    readingTime,
    ${authorProjection}
  }
`;

export const latestPublicationsQuery = groq`
  *[_type == "publication" && !(_id in path('drafts.**'))] | order(publishedAt desc)[0...3] {
    _id,
    title,
    "slug": slug.current,
    category,
    writingSubtype,
    subtitle,
    excerpt,
    coverImage,
    imageAlt,
    publishedAt,
    readingTime,
    ${authorProjection}
  }
`;

export const allSlugsByCategoryQuery = groq`
  *[_type == "publication" && category == $category && !(_id in path('drafts.**')) && defined(slug.current)] {
    "slug": slug.current
  }
`;

export const allPublicSlugsQuery = groq`
  *[_type == "publication" && !(_id in path('drafts.**')) && defined(slug.current)] {
    "slug": slug.current,
    category,
    publishedAt
  }
`;

export const allAuthorsQuery = groq`
  *[_type == "author" && !(_id in path('drafts.**'))] | order(_createdAt asc)[0...2] {
    _id,
    name,
    "slug": slug.current,
    role,
    shortBio,
    fullBio,
    quote,
    picture,
    socialLinks
  }
`;

export const authorBySlugQuery = groq`
  *[_type == "author" && slug.current == $slug && !(_id in path('drafts.**'))][0] {
    _id,
    name,
    "slug": slug.current,
    role,
    shortBio,
    fullBio,
    quote,
    picture,
    socialLinks
  }
`;

export const allAuthorSlugsQuery = groq`
  *[_type == "author" && !(_id in path('drafts.**')) && defined(slug.current)] {
    "slug": slug.current
  }
`;

export const authorProfileQuery = allAuthorsQuery;

export const siteSettingsQuery = groq`
  *[_type == "siteSettings" && _id == "siteSettings" && !(_id in path('drafts.**'))][0] {
    title,
    tagline,
    welcomeMessage,
    contactEmail
  }
`;

