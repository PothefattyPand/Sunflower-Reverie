import { Publication, AuthorProfile, SiteSettings } from "@/types";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getPublicSupabase } from "@/lib/supabase/public";
import { MOCK_AUTHORS } from "@/data/mockData";

function formatIsoDate(isoString?: string): { date: string; isoDate: string } {
  if (!isoString) {
    return {
      date: "",
      isoDate: "",
    };
  }
  const d = new Date(isoString);
  return {
    date: isNaN(d.getTime())
      ? isoString
      : d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    isoDate: isNaN(d.getTime()) ? isoString : d.toISOString().split("T")[0],
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSupabaseToAuthor(row: any): AuthorProfile {
  return {
    id: row.id,
    name: row.display_name || "Author",
    slug: row.slug || "author",
    isPublicAuthor: Boolean(row.is_public_author),
    role: row.role || "Curator & Author",
    shortBio: row.short_bio,
    fullBio: row.full_bio,
    quote: row.quote,
    pictureUrl: row.avatar_url,
    socialLinks: Array.isArray(row.social_links) ? row.social_links : [],
    interests: Array.isArray(row.interests) ? row.interests : [],
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSupabaseToPublication(row: any): Publication {
  const profile = row.profiles || {};
  const authorName = row.author_name || profile.display_name;
  const authorSlug = row.author_slug || profile.slug;
  const authorId = row.author_id || profile.id;

  const isPoetry = row.category === "poetry";
  const bodyText = row.body || "";
  const paragraphs = bodyText.split(/\n\s*\n/).filter(Boolean);
  const stanzas = isPoetry
    ? bodyText.split(/\n\s*\n/).map((s: string) => s.split("\n").map((l: string) => l.trim()).filter(Boolean))
    : undefined;

  const { date, isoDate } = formatIsoDate(row.published_at || row.created_at);

  return {
    id: row.id,
    slug: row.slug,
    type: row.category,
    writingSubtype: row.writing_subtype || undefined,
    title: row.title,
    subtitle: row.subtitle || undefined,
    author: {
      id: authorId || "nadvi",
      name: authorName || "Nadvi",
      slug: authorSlug || "nadvi",
      role: row.author_role || profile.role || "Author & Curator",
      pictureUrl: row.author_avatar_url || profile.avatar_url,
    },
    date,
    isoDate,
    excerpt: row.excerpt || "",
    body: paragraphs.length > 0 ? paragraphs : [bodyText],
    stanzas,
    readingTime: row.reading_time || "4 min read",
    tags: Array.isArray(row.tags) ? row.tags : [],
    coverImage: row.cover_image
      ? {
          src: row.cover_image,
          alt: row.title,
        }
      : undefined,
    featured: false,
    seoTitle: row.title,
    seoDescription: row.excerpt,
    isSampleContent: false,
    isAnonymous: false,
  };
}

function isViewPendingError(error: { code?: string } | null | undefined): boolean {
  if (!error || !error.code) return false;
  // PGRST205: View not in schema cache; 42P01: undefined table; 42501: permission denied; PGRST301: JWT/role denial
  return ["PGRST205", "42P01", "42501", "PGRST301"].includes(error.code);
}

// ==========================================
// Central Query Helper Functions (Supabase Backed)
// Returns real published data or empty collections.
// ==========================================

export async function fetchAllPublications(): Promise<Publication[]> {
  if (isSupabaseConfigured) {
    try {
      const supabase = getPublicSupabase();
      if (supabase) {
        let { data, error } = await supabase
          .from("public_publications")
          .select("*")
          .order("published_at", { ascending: false });

        // Graceful fallback for environments before migration is applied
        if (isViewPendingError(error)) {
          const fallback = await supabase
            .from("publications")
            .select("*, profiles(*)")
            .eq("status", "published")
            .order("published_at", { ascending: false });
          data = fallback.data;
          error = fallback.error;
        }

        if (!error && data) {
          return data.map(mapSupabaseToPublication);
        }
        if (error) {
          console.error("[Supabase] Error fetching all publications:", error);
        }
      }
    } catch (err) {
      console.error("[Supabase] Error fetching all publications:", err);
    }
  }
  return [];
}

export async function fetchPublicationsByCategory(category: Publication["type"]): Promise<Publication[]> {
  if (isSupabaseConfigured) {
    try {
      const supabase = getPublicSupabase();
      if (supabase) {
        let { data, error } = await supabase
          .from("public_publications")
          .select("*")
          .eq("category", category)
          .order("published_at", { ascending: false });

        if (isViewPendingError(error)) {
          const fallback = await supabase
            .from("publications")
            .select("*, profiles(*)")
            .eq("category", category)
            .eq("status", "published")
            .order("published_at", { ascending: false });
          data = fallback.data;
          error = fallback.error;
        }

        if (!error && data) {
          return data.map(mapSupabaseToPublication);
        }
        if (error) {
          console.error(`[Supabase] Error fetching category '${category}':`, error);
        }
      }
    } catch (err) {
      console.error(`[Supabase] Error fetching category '${category}':`, err);
    }
  }
  return [];
}

export async function fetchPublicationBySlug(
  category: Publication["type"],
  slug: string
): Promise<Publication | undefined> {
  if (isSupabaseConfigured) {
    try {
      const supabase = getPublicSupabase();
      if (supabase) {
        let { data, error } = await supabase
          .from("public_publications")
          .select("*")
          .eq("category", category)
          .eq("slug", slug)
          .maybeSingle();

        if (isViewPendingError(error)) {
          const fallback = await supabase
            .from("publications")
            .select("*, profiles(*)")
            .eq("category", category)
            .eq("slug", slug)
            .eq("status", "published")
            .maybeSingle();
          data = fallback.data;
          error = fallback.error;
        }

        if (!error && data) {
          return mapSupabaseToPublication(data);
        }
        if (error) {
          console.error(`[Supabase] Error fetching publication '${slug}':`, error);
        }
      }
    } catch (err) {
      console.error(`[Supabase] Error fetching publication '${slug}':`, err);
    }
  }
  return undefined;
}

export async function fetchPublicationsByAuthor(authorSlug: string): Promise<Publication[]> {
  // Mahi's public author folio is disabled; never return any publications under Mahi's slug
  if (authorSlug.toLowerCase() === "mahi") {
    return [];
  }
  if (isSupabaseConfigured) {
    try {
      const supabase = getPublicSupabase();
      if (supabase) {
        let profileResult = await supabase
          .from("profiles")
          .select("id, is_public_author")
          .eq("slug", authorSlug)
          .eq("is_public_author", true)
          .neq("slug", "mahi")
          .neq("id", "76aaf5a8-7029-45dc-a7c7-ad4f25255be6")
          .maybeSingle();

        if (profileResult.error && profileResult.error.code === "42703") {
          profileResult = await supabase
            .from("profiles")
            .select("id")
            .eq("slug", authorSlug)
            .neq("slug", "mahi")
            .neq("id", "76aaf5a8-7029-45dc-a7c7-ad4f25255be6")
            .maybeSingle();
        }

        const profile = profileResult.data;
        const profileError = profileResult.error;

        if (
          profile?.id &&
          profile.id !== "76aaf5a8-7029-45dc-a7c7-ad4f25255be6"
        ) {
          let pubResult = await supabase
            .from("public_publications")
            .select("*")
            .eq("author_slug", authorSlug)
            .order("published_at", { ascending: false });

          if (isViewPendingError(pubResult.error)) {
            pubResult = await supabase
              .from("publications")
              .select("*, profiles(*)")
              .eq("author_id", profile.id)
              .eq("status", "published")
              .order("published_at", { ascending: false });
          }

          if (!pubResult.error && pubResult.data) {
            return pubResult.data.map(mapSupabaseToPublication);
          }
          if (pubResult.error) {
            console.error(`[Supabase] Error fetching publications for author '${authorSlug}':`, pubResult.error);
          }
        } else if (profileError) {
          console.error(`[Supabase] Error finding profile for author '${authorSlug}':`, profileError);
        }
      }
    } catch (err) {
      console.error(`[Supabase] Error fetching publications for author '${authorSlug}':`, err);
    }
  }
  return [];
}

export async function fetchFeaturedPublications(): Promise<Publication[]> {
  if (isSupabaseConfigured) {
    try {
      const supabase = getPublicSupabase();
      if (supabase) {
        let { data, error } = await supabase
          .from("public_publications")
          .select("*")
          .order("published_at", { ascending: false })
          .limit(3);

        if (isViewPendingError(error)) {
          const fallback = await supabase
            .from("publications")
            .select("*, profiles(*)")
            .eq("status", "published")
            .order("published_at", { ascending: false })
            .limit(3);
          data = fallback.data;
          error = fallback.error;
        }

        if (!error && data) {
          return data.map(mapSupabaseToPublication);
        }
        if (error) {
          console.error("[Supabase] Error fetching featured publications:", error);
        }
      }
    } catch (err) {
      console.error("[Supabase] Error fetching featured publications:", err);
    }
  }
  return [];
}

export async function fetchLatestPublications(limit = 3): Promise<Publication[]> {
  if (isSupabaseConfigured) {
    try {
      const supabase = getPublicSupabase();
      if (supabase) {
        let { data, error } = await supabase
          .from("public_publications")
          .select("*")
          .order("published_at", { ascending: false })
          .limit(limit);

        if (isViewPendingError(error)) {
          const fallback = await supabase
            .from("publications")
            .select("*, profiles(*)")
            .eq("status", "published")
            .order("published_at", { ascending: false })
            .limit(limit);
          data = fallback.data;
          error = fallback.error;
        }

        if (!error && data) {
          return data.map(mapSupabaseToPublication);
        }
        if (error) {
          console.error("[Supabase] Error fetching latest publications:", error);
        }
      }
    } catch (err) {
      console.error("[Supabase] Error fetching latest publications:", err);
    }
  }
  return [];
}

export async function fetchCategorySlugs(category: Publication["type"]): Promise<string[]> {
  if (isSupabaseConfigured) {
    try {
      const supabase = getPublicSupabase();
      if (supabase) {
        let { data, error } = await supabase
          .from("public_publications")
          .select("slug")
          .eq("category", category);

        if (isViewPendingError(error)) {
          const fallback = await supabase
            .from("publications")
            .select("slug")
            .eq("category", category)
            .eq("status", "published");
          data = fallback.data;
          error = fallback.error;
        }

        if (!error && data) {
          return data.map((r: { slug: string }) => r.slug);
        }
        if (error) {
          console.error(`[Supabase] Error fetching slugs for category '${category}':`, error);
        }
      }
    } catch (err) {
      console.error(`[Supabase] Error fetching slugs for category '${category}':`, err);
    }
  }
  return [];
}

export async function fetchAllPublicSlugs(): Promise<{ slug: string; category: string; publishedAt?: string }[]> {
  if (isSupabaseConfigured) {
    try {
      const supabase = getPublicSupabase();
      if (supabase) {
        let { data, error } = await supabase
          .from("public_publications")
          .select("slug, category, published_at");

        if (isViewPendingError(error)) {
          const fallback = await supabase
            .from("publications")
            .select("slug, category, published_at")
            .eq("status", "published");
          data = fallback.data;
          error = fallback.error;
        }

        if (!error && data) {
          return data.map((r: { slug: string; category: string; published_at?: string }) => ({
            slug: r.slug,
            category: r.category === "writing" ? "writings" : r.category,
            publishedAt: r.published_at,
          }));
        }
        if (error) {
          console.error("[Supabase] Error fetching all public slugs:", error);
        }
      }
    } catch (err) {
      console.error("[Supabase] Error fetching all public slugs:", err);
    }
  }
  return [];
}

export async function fetchAllAuthors(): Promise<AuthorProfile[]> {
  if (isSupabaseConfigured) {
    try {
      const supabase = getPublicSupabase();
      if (supabase) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .neq("slug", "mahi")
          .neq("id", "76aaf5a8-7029-45dc-a7c7-ad4f25255be6")
          .order("created_at", { ascending: true });

        if (!error && data && data.length > 0) {
          const authors = data
            .filter(
              (r) =>
                r.slug !== "mahi" &&
                r.id !== "76aaf5a8-7029-45dc-a7c7-ad4f25255be6"
            )
            .map(mapSupabaseToAuthor);
          if (authors.length > 0) return authors;
        }
        if (error) {
          console.error("[Supabase] Error fetching all authors:", error);
        }
      }
    } catch (err) {
      console.error("[Supabase] Error fetching all authors:", err);
    }
  }
  return MOCK_AUTHORS;
}

export async function fetchAuthorBySlug(slug: string): Promise<AuthorProfile | undefined> {
  // Mahi is strictly hidden and retired; block any lookup of Mahi's profile
  if (slug.toLowerCase() === "mahi") {
    return undefined;
  }
  if (isSupabaseConfigured) {
    try {
      const supabase = getPublicSupabase();
      if (supabase) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("slug", slug)
          .neq("id", "76aaf5a8-7029-45dc-a7c7-ad4f25255be6")
          .maybeSingle();

        if (
          !error &&
          data &&
          data.slug !== "mahi" &&
          data.id !== "76aaf5a8-7029-45dc-a7c7-ad4f25255be6"
        ) {
          return mapSupabaseToAuthor(data);
        }
        if (error) {
          console.error(`[Supabase] Error fetching author '${slug}':`, error);
        }
      }
    } catch (err) {
      console.error(`[Supabase] Error fetching author '${slug}':`, err);
    }
  }
  return MOCK_AUTHORS.find((a: AuthorProfile) => a.slug === slug);
}

export async function fetchAllAuthorSlugs(): Promise<string[]> {
  if (isSupabaseConfigured) {
    try {
      const supabase = getPublicSupabase();
      if (supabase) {
        const { data, error } = await supabase
          .from("profiles")
          .select("slug")
          .neq("slug", "mahi")
          .neq("id", "76aaf5a8-7029-45dc-a7c7-ad4f25255be6");

        if (!error && data && data.length > 0) {
          const slugs = data
            .filter((r: { slug: string }) => r.slug !== "mahi")
            .map((r: { slug: string }) => r.slug);
          if (slugs.length > 0) return slugs;
        }
        if (error) {
          console.error("[Supabase] Error fetching author slugs:", error);
        }
      }
    } catch (err) {
      console.error("[Supabase] Error fetching author slugs:", err);
    }
  }
  return MOCK_AUTHORS.map((a: AuthorProfile) => a.slug);
}

export async function fetchAuthorProfile(): Promise<AuthorProfile | undefined> {
  const authors = await fetchAllAuthors();
  return authors[0];
}

export async function fetchSiteSettings(): Promise<SiteSettings | undefined> {
  return undefined;
}

// Synchronous helpers for fallback and component related-posts
export function getAllPublications(): Publication[] {
  return [];
}

export function getPublicationsByType(type: Publication["type"]): Publication[] {
  void type;
  return [];
}

export function getPublicationBySlug(type: Publication["type"], slug: string): Publication | undefined {
  void type;
  void slug;
  return undefined;
}

export function getAllSlugsByType(type: Publication["type"]): string[] {
  void type;
  return [];
}

export function getRelatedPublications(
  currentId: string,
  type: Publication["type"],
  limit: number = 3,
  items?: Publication[]
): Publication[] {
  const source = items && items.length > 0 ? items : [];
  return source.filter((p) => p.id !== currentId && p.type === type).slice(0, limit);
}
