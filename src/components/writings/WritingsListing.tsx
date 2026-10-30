"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Feather, FileText, Filter, Search, X } from "lucide-react";
import { AuthorProfile, Publication, WritingSubtype } from "@/types";

interface WritingsListingProps {
  initialPublications: Publication[];
  authors?: AuthorProfile[];
}

const SUBTYPES: { label: string; value: WritingSubtype | "all" }[] = [
  { label: "All Works", value: "all" },
  { label: "Essays", value: "essay" },
  { label: "Short Stories", value: "short-story" },
  { label: "Letters", value: "letter" },
  { label: "Creative Prose", value: "creative-prose" },
];

export function WritingsListing({ initialPublications, authors }: WritingsListingProps) {
  const [selectedSubtype, setSelectedSubtype] = useState<WritingSubtype | "all">("all");
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  const filtered = useMemo(() => {
    return initialPublications.filter((p) => {
      const matchesSubtype =
        selectedSubtype === "all" || p.writingSubtype === selectedSubtype;

      const matchesAuthor = !selectedAuthor || p.author?.slug === selectedAuthor;

      const matchesSearch =
        searchQuery.trim() === "" ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.author?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesSubtype && matchesAuthor && matchesSearch;
    });
  }, [initialPublications, selectedSubtype, selectedAuthor, searchQuery]);

  if (!initialPublications || initialPublications.length === 0) {
    return (
      <div className="text-center py-20 px-6 rounded-3xl bg-[#FFF3D9]/50 border-2 border-dashed border-[#EADBCE] space-y-4 max-w-xl mx-auto">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#FFF9EC] border border-[#E8AF30] flex items-center justify-center">
          <FileText className="w-8 h-8 text-[#E8AF30]" />
        </div>
        <h2 className="font-caveat text-3xl sm:text-4xl font-bold text-[#3B3028]">
          A new collection of words will blossom here soon.
        </h2>
        <p className="font-nunito text-base text-[#6B584C] leading-relaxed">
          Our co-curators are currently tending essays and letters at the writing desk; check back soon as fresh pages are gathered.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Filtering & Search Header */}
      <div className="p-6 rounded-2xl bg-[#FFF3D9]/60 border border-[#EADBCE] space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B584C]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search essays, stories, authors, or letters..."
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
              Filter by Author:
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
              All Authors
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

        {/* Subtype Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#EADBCE]/60">
          <span className="text-xs font-bold uppercase tracking-wider text-[#718B55] flex items-center gap-1 mr-1 font-nunito">
            <Filter className="w-3 h-3 text-[#E8AF30]" />
            Writing Genre:
          </span>
          {SUBTYPES.map((sub) => {
            const isSelected = selectedSubtype === sub.value;
            return (
              <button
                key={sub.value}
                type="button"
                onClick={() => setSelectedSubtype(sub.value)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-patrick font-semibold transition-all ${
                  isSelected
                    ? "bg-[#E8AF30] text-[#3B3028] shadow-xs"
                    : "bg-[#FFF9EC] text-[#6B584C] hover:text-[#3B3028] border border-[#EADBCE]"
                }`}
              >
                {sub.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Writings */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filtered.map((item) => (
            <article
              key={item.id}
              className="group flex flex-col justify-between rounded-2xl bg-[#FFF3D9]/40 hover:bg-[#FFF3D9] border border-[#EADBCE] hover:border-[#E8AF30] p-7 transition-all duration-300 shadow-xs hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#718B55] font-nunito font-semibold">
                  <span className="uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFF9EC] border border-[#EADBCE]">
                    {item.writingSubtype?.replace("-", " ") || "Prose"}
                  </span>
                  <span className="flex items-center gap-1 text-[#6B584C]">
                    <Clock className="w-3.5 h-3.5 text-[#E8AF30]" />
                    {item.readingTime}
                  </span>
                </div>

                {/* Author Attribution */}
                {item.author && (
                  <div className="flex items-center gap-1.5 text-xs text-[#6B584C] font-nunito">
                    <Feather className="w-3 h-3 text-[#E8AF30]" />
                    <span>Penned by</span>
                    <Link
                      href={`/authors/${item.author.slug}`}
                      className="font-semibold text-[#3B3028] hover:text-[#E8AF30] underline-offset-2 hover:underline"
                    >
                      {item.author.name}
                    </Link>
                  </div>
                )}

                <h2 className="font-patrick text-2xl sm:text-3xl font-bold text-[#3B3028] group-hover:text-[#E8AF30] transition-colors leading-snug">
                  <Link href={`/writings/${item.slug}`} className="focus:outline-hidden">
                    {item.title}
                  </Link>
                </h2>

                {item.subtitle && (
                  <p className="font-kalam text-base text-[#718B55] font-semibold">
                    {item.subtitle}
                  </p>
                )}

                <p className="font-nunito text-[#3B3028]/90 text-base leading-relaxed line-clamp-3">
                  {item.excerpt}
                </p>

                {item.tags && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {item.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[11px] font-nunito font-bold px-2 py-0.5 rounded-md bg-[#FFF9EC] text-[#6B584C] border border-[#EADBCE]/80"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-6 mt-6 border-t border-[#EADBCE]/70 flex items-center justify-between text-base font-patrick font-semibold text-[#3B3028] group-hover:text-[#E8AF30] transition-colors">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#E8AF30]" />
                  Read Full Work
                </span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 rounded-2xl bg-[#FFF3D9]/30 border border-dashed border-[#EADBCE]">
          <FileText className="w-8 h-8 text-[#E8AF30] mx-auto mb-3" />
          <h3 className="font-patrick text-2xl font-bold text-[#3B3028] mb-1">
            No writings match your criteria
          </h3>
          <p className="text-sm text-[#6B584C] font-nunito max-w-sm mx-auto mb-4">
            Try clearing your search query or selecting &ldquo;All Works&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedSubtype("all");
              setSelectedAuthor(null);
              setSearchQuery("");
            }}
            className="px-4 py-2 rounded-full bg-[#E8AF30] text-[#3B3028] text-sm font-patrick font-semibold hover:bg-[#F4C542] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
