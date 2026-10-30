import { Publication, AuthorProfile, SiteSettings } from "@/types";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getPublicSupabase } from "@/lib/supabase/public";

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
    role: row.role || "Co-Curator & Author",
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
      id: profile.id || row.author_id,
      name: profile.display_name || "Author",
      slug: profile.slug || "author",
      role: profile.role,
      pictureUrl: profile.avatar_url,
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
  };
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
        const { data, error } = await supabase
          .from("publications")
          .select("*, profiles(*)")
          .eq("status", "published")
          .order("published_at", { ascending: false });
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
        const { data, error } = await supabase
          .from("publications")
          .select("*, profiles(*)")
          .eq("category", category)
          .eq("status", "published")
          .order("published_at", { ascending: false });
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
        const { data, error } = await supabase
          .from("publications")
          .select("*, profiles(*)")
          .eq("category", category)
          .eq("slug", slug)
          .eq("status", "published")
          .maybeSingle();
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
  if (isSupabaseConfigured) {
    try {
      const supabase = getPublicSupabase();
      if (supabase) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("slug", authorSlug)
          .maybeSingle();

        if (profile?.id) {
          const { data, error } = await supabase
            .from("publications")
            .select("*, profiles(*)")
            .eq("author_id", profile.id)
            .eq("status", "published")
            .order("published_at", { ascending: false });
          if (!error && data) {
            return data.map(mapSupabaseToPublication);
          }
          if (error) {
            console.error(`[Supabase] Error fetching publications for author '${authorSlug}':`, error);
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
        const { data, error } = await supabase
          .from("publications")
          .select("*, profiles(*)")
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(3);
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
        const { data, error } = await supabase
          .from("publications")
          .select("*, profiles(*)")
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(limit);
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
        const { data, error } = await supabase
          .from("publications")
          .select("slug")
          .eq("category", category)
          .eq("status", "published");
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
        const { data, error } = await supabase
          .from("publications")
          .select("slug, category, published_at")
          .eq("status", "published");
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
          .order("created_at", { ascending: true });
        if (!error && data) {
          return data.map(mapSupabaseToAuthor);
        }
        if (error) {
          console.error("[Supabase] Error fetching all authors:", error);
        }
      }
    } catch (err) {
      console.error("[Supabase] Error fetching all authors:", err);
    }
  }
  return [];
}

export async function fetchAuthorBySlug(slug: string): Promise<AuthorProfile | undefined> {
  if (isSupabaseConfigured) {
    try {
      const supabase = getPublicSupabase();
      if (supabase) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();
        if (!error && data) {
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
  return undefined;
}

export async function fetchAllAuthorSlugs(): Promise<string[]> {
  if (isSupabaseConfigured) {
    try {
      const supabase = getPublicSupabase();
      if (supabase) {
        const { data, error } = await supabase
          .from("profiles")
          .select("slug");
        if (!error && data) {
          return data.map((r: { slug: string }) => r.slug);
        }
        if (error) {
          console.error("[Supabase] Error fetching author slugs:", error);
        }
      }
    } catch (err) {
      console.error("[Supabase] Error fetching author slugs:", err);
    }
  }
  return [];
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
