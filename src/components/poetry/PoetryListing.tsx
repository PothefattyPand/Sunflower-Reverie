"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Feather, Search, Sparkles, Tag, X } from "lucide-react";
import { AuthorProfile, Publication } from "@/types";

interface PoetryListingProps {
  initialPublications: Publication[];
  authors?: AuthorProfile[];
}

export function PoetryListing({ initialPublications, authors }: PoetryListingProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);

  // Available authors
  const availableAuthors = useMemo(() => {
    if (authors && authors.length > 0) {
      return authors;
    }
    const map = new Map<string, { id?: string; name: string; slug: string }>();
    initialPublications.forEach((p) => {
      if (p.author?.slug && !map.has(p.author.slug)) {
        map.set(p.author.slug, {
          id: p.author.id || p.author.slug,
          name: p.author.name,
          slug: p.author.slug,
        });
      }
    });
    return Array.from(map.values());
  }, [authors, initialPublications]);

  // Extract unique tags
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    initialPublications.forEach((p) => {
      p.tags?.forEach((t) => tagsSet.add(t));
    });
    return Array.from(tagsSet);
  }, [initialPublications]);

  // Filter poems
  const filtered = useMemo(() => {
    return initialPublications.filter((p) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === "" ||
        p.title.toLowerCase().includes(query) ||
        p.excerpt.toLowerCase().includes(query) ||
        p.author?.name.toLowerCase().includes(query) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(query)) ||
        p.tags?.some((t) => t.toLowerCase().includes(query));

      const matchesTag = !selectedTag || p.tags?.includes(selectedTag);
      const matchesAuthor = !selectedAuthor || p.author?.slug === selectedAuthor;

      return matchesSearch && matchesTag && matchesAuthor;
    });
  }, [initialPublications, searchQuery, selectedTag, selectedAuthor]);

  if (!initialPublications || initialPublications.length === 0) {
    return (
      <div className="text-center py-20 px-6 rounded-3xl bg-[#FFF3D9]/50 border-2 border-dashed border-[#EADBCE] space-y-4 max-w-xl mx-auto">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#FFF9EC] border border-[#E8AF30] flex items-center justify-center">
          <Feather className="w-8 h-8 text-[#E8AF30]" />
        </div>
        <h2 className="font-caveat text-3xl sm:text-4xl font-bold text-[#3B3028]">
          The first verse is still waiting to bloom.
        </h2>
        <p className="font-nunito text-base text-[#6B584C] leading-relaxed">
          We are tending meter and cadence at the desk; return soon to read poetry in bloom beneath the open sky.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Search & Theme Bar */}
      <div className="p-6 rounded-2xl bg-[#FFF3D9]/60 border border-[#EADBCE] space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B584C]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search verses by title, author, or poetic imagery..."
            className="w-full pl-11 pr-10 py-3 rounded-xl bg-[#FFF9EC] border border-[#EADBCE] text-sm text-[#3B3028] placeholder-[#6B584C]/60 focus:outline-hidden focus:border-[#E8AF30] focus:ring-1 focus:ring-[#E8AF30] transition-colors font-nunito"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#6B584C] hover:text-[#3B3028]"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Author Filter Pills */}
        {availableAuthors.length > 1 && (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#EADBCE]/60">
            <span className="text-xs font-bold uppercase tracking-wider text-[#718B55] flex items-center gap-1 mr-1 font-nunito">
              <Feather className="w-3 h-3 text-[#E8AF30]" />
              Filter by Poet:
            </span>
            <button
              type="button"
              onClick={() => setSelectedAuthor(null)}
              className={`px-3 py-1 rounded-full text-xs font-patrick font-semibold transition-colors ${
                selectedAuthor === null
                  ? "bg-[#E8AF30] text-[#3B3028] shadow-xs"
                  : "bg-[#FFF9EC] text-[#6B584C] hover:text-[#3B3028] border border-[#EADBCE]"
              }`}
            >
              All Poets
            </button>
            {availableAuthors.map((auth) => (
              <button
                key={auth.slug}
                type="button"
                onClick={() => setSelectedAuthor(selectedAuthor === auth.slug ? null : auth.slug)}
                className={`px-3 py-1 rounded-full text-xs font-patrick font-semibold transition-colors ${
                  selectedAuthor === auth.slug
                    ? "bg-[#E8AF30] text-[#3B3028] shadow-xs"
                    : "bg-[#FFF9EC] text-[#6B584C] hover:text-[#3B3028] border border-[#EADBCE]"
                }`}
              >
                {auth.name}
              </button>
            ))}
          </div>
        )}

        {/* Tag Pills */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#EADBCE]/60">
            <span className="text-xs font-bold uppercase tracking-wider text-[#718B55] flex items-center gap-1 mr-1 font-nunito">
              <Tag className="w-3 h-3 text-[#E8AF30]" />
              Poetic Themes:
            </span>
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1 rounded-full text-xs font-patrick font-semibold transition-colors ${
                selectedTag === null
                  ? "bg-[#E8AF30] text-[#3B3028] shadow-xs"
                  : "bg-[#FFF9EC] text-[#6B584C] hover:text-[#3B3028] border border-[#EADBCE]"
              }`}
            >
              All Themes
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-3 py-1 rounded-full text-xs font-patrick font-semibold transition-colors ${
                  selectedTag === tag
                    ? "bg-[#E8AF30] text-[#3B3028] shadow-xs"
                    : "bg-[#FFF9EC] text-[#6B584C] hover:text-[#3B3028] border border-[#EADBCE]"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Poems Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
          {filtered.map((poem) => (
            <article
              key={poem.id}
              className="group relative flex flex-col justify-between rounded-2xl bg-[#FFF3D9]/50 hover:bg-[#FFF3D9] border-2 border-[#EADBCE] hover:border-[#E8AF30] p-7 sm:p-9 shadow-xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Botanical Watermark Accent */}
              <div
                className="absolute top-4 right-4 text-[#E8AF30]/20 pointer-events-none group-hover:text-[#E8AF30]/40 transition-colors"
                aria-hidden="true"
              >
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="8" fill="currentColor" />
                  <path d="M20 2 C23 9 23 9 20 12 C17 9 17 9 20 2 Z" fill="currentColor" />
                  <path d="M20 38 C23 31 23 31 20 28 C17 31 17 31 20 38 Z" fill="currentColor" />
                  <path d="M2 20 C9 23 9 23 12 20 C9 17 9 17 2 20 Z" fill="currentColor" />
                  <path d="M38 20 C31 23 31 23 28 20 C31 17 31 17 38 20 Z" fill="currentColor" />
                </svg>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-[#718B55] font-patrick mb-3">
                  <span className="uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFF9EC] border border-[#EADBCE]">
                    {poem.tags?.[0] || "Poem"}
                  </span>
                  <span className="text-[#6B584C] font-nunito">{poem.readingTime}</span>
                </div>

                {/* Author Attribution */}
                {poem.author && (
                  <div className="flex items-center gap-1.5 text-xs text-[#6B584C] font-nunito mb-2">
                    <Feather className="w-3 h-3 text-[#E8AF30]" />
                    <span>Penned by</span>
                    {poem.isAnonymous || !poem.author.slug ? (
                      <span className="font-semibold text-[#3B3028]">Anonymous</span>
                    ) : (
                      <Link
                        href={`/authors/${poem.author.slug}`}
                        className="font-semibold text-[#3B3028] hover:text-[#E8AF30] underline-offset-2 hover:underline"
                      >
                        {poem.author.name}
                      </Link>
                    )}
                  </div>
                )}

                <h2 className="font-patrick text-2xl sm:text-3xl font-bold text-[#3B3028] group-hover:text-[#E8AF30] transition-colors leading-snug mb-2">
                  <Link href={`/poetry/${poem.slug}`} className="focus:outline-hidden">
                    {poem.title}
                  </Link>
                </h2>

                {poem.subtitle && (
                  <p className="font-kalam text-sm text-[#718B55] mb-6">
                    {poem.subtitle}
                  </p>
                )}

                <div className="pl-4 border-l-2 border-[#E8AF30]/50 my-6 space-y-1 font-kalam text-[#3B3028]/90 text-lg sm:text-xl leading-relaxed">
                  {poem.excerpt.split("\n").map((line, lIdx) => (
                    <p key={lIdx}>{line}</p>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#EADBCE]/70 flex items-center justify-between text-base font-patrick font-bold text-[#3B3028] group-hover:text-[#E8AF30] transition-colors">
                <span className="flex items-center gap-1.5">
                  <Feather className="w-3.5 h-3.5 text-[#E8AF30]" />
                  Read Full Poem
                </span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 rounded-2xl bg-[#FFF3D9]/30 border border-dashed border-[#EADBCE]">
          <Sparkles className="w-8 h-8 text-[#E8AF30] mx-auto mb-3" />
          <h3 className="font-patrick text-2xl font-bold text-[#3B3028] mb-1">
            No verses match your search
          </h3>
          <p className="text-sm text-[#6B584C] font-nunito max-w-sm mx-auto mb-4">
            Try adjusting your search terms or clearing the selected author or poetic theme.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedTag(null);
              setSelectedAuthor(null);
            }}
            className="px-4 py-2 rounded-full bg-[#E8AF30] text-[#3B3028] text-sm font-patrick font-semibold hover:bg-[#F4C542] transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
