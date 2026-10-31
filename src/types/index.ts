/**
 * Core type definitions for Sunflower Reverie
 */

export interface NavItem {
  label: string;
  href: string;
}

export type PublicationType = "blog" | "poetry" | "journal" | "writing";

export type WritingSubtype = "essay" | "short-story" | "letter" | "reflection" | "creative-prose";

export interface CoverImage {
  src?: string;
  alt: string;
  caption?: string;
}

export interface AuthorSummary {
  id?: string;
  name: string;
  slug: string;
  role?: string;
  pictureUrl?: string;
}

export interface Publication {
  id: string;
  slug: string;
  type: PublicationType;
  title: string;
  subtitle?: string;
  author: AuthorSummary;
  date: string; // e.g. "October 28, 2026"
  isoDate: string; // "2026-10-28"
  excerpt: string;
  body: string[]; // array of paragraphs for rich reading
  stanzas?: string[][]; // specific for poetry to preserve line breaks and stanzas
  writingSubtype?: WritingSubtype; // for filtering in /writings
  readingTime?: string;
  tags?: string[];
  coverImage?: CoverImage;
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  isSampleContent: boolean;
  isAnonymous?: boolean;
}

export interface AuthorSocialLink {
  platform?: string;
  url?: string;
}

export interface AuthorProfile {
  id: string;
  name: string;
  slug: string;
  isPublicAuthor?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  picture?: any;
  pictureUrl?: string;
  role?: string;
  shortBio?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fullBio?: any;
  quote?: string;
  socialLinks?: AuthorSocialLink[];
  interests?: string[];
}

export interface SiteSettings {
  title?: string;
  tagline?: string;
  welcomeMessage?: string;
  contactEmail?: string;
}
