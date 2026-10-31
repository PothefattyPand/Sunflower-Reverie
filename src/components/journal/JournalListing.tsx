"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Calendar, Clock, Feather, Search, Sparkles, X } from "lucide-react";
import { AuthorProfile, Publication } from "@/types";

interface JournalListingProps {
  initialPublications: Publication[];
  authors?: AuthorProfile[];
}

export function JournalListing({ initialPublications, authors }: JournalListingProps) {
  const [searchQuery, setSearchQuery] = useState("");
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

  const filtered = useMemo(() => {
    const sorted = [...initialPublications].sort(
      (a, b) => new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime()
    );

    return sorted.filter((entry) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        entry.title.toLowerCase().includes(query) ||
        entry.excerpt.toLowerCase().includes(query) ||
        entry.author?.name.toLowerCase().includes(query) ||
        (entry.subtitle && entry.subtitle.toLowerCase().includes(query)) ||
        entry.date.toLowerCase().includes(query);

      const matchesAuthor = !selectedAuthor || entry.author?.slug === selectedAuthor;

      return matchesSearch && matchesAuthor;
    });
  }, [initialPublications, searchQuery, selectedAuthor]);

  if (!initialPublications || initialPublications.length === 0) {
    return (
      <div className="text-center py-20 px-6 rounded-3xl bg-[#FFF3D9]/50 border-2 border-dashed border-[#EADBCE] space-y-4 max-w-xl mx-auto">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#FFF9EC] border border-[#E8AF30] flex items-center justify-center">
          <BookOpen className="w-8 h-8 text-[#E8AF30]" />
        </div>
        <h2 className="font-caveat text-3xl sm:text-4xl font-bold text-[#3B3028]">
          These pages are waiting for their first reflection.
        </h2>
        <p className="font-nunito text-base text-[#6B584C] leading-relaxed">
          As days unfold in the garden, new field notes and morning reflections will be gathered here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Search & Author Filter Bar */}
      <div className="p-6 rounded-2xl bg-[#FFF3D9]/60 border border-[#EADBCE] space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B584C]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search journal entries by date, author, or morning notes..."
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
              Filter by Diarist:
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
              All Diarists
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
      </div>

      {/* Dated Timeline Layout */}
      {filtered.length > 0 ? (
        <div className="relative border-l-2 border-[#EADBCE] ml-4 sm:ml-28 pl-6 sm:pl-10 space-y-12">
          {filtered.map((entry) => (
            <article key={entry.id} className="relative group">
              {/* Timeline Indicator Dot */}
              <div className="absolute -left-[31px] sm:-left-[47px] top-1.5 w-4 h-4 rounded-full bg-[#FFF9EC] border-2 border-[#E8AF30] group-hover:bg-[#E8AF30] transition-colors" />

              {/* Large Desktop Date Badge on Left Axis */}
              <div className="hidden sm:block absolute -left-36 top-1 text-right w-24">
                <span className="font-patrick text-base font-bold uppercase tracking-wider text-[#718B55] block">
                  {entry.date.split(",")[0]}
                </span>
                <span className="text-xs text-[#6B584C] font-mono">
                  {entry.isoDate ? entry.isoDate.split("-")[0] : ""}
                </span>
              </div>

              {/* Entry Card */}
              <div className="p-6 sm:p-8 rounded-2xl bg-[#FFF3D9]/50 hover:bg-[#FFF3D9] border border-[#EADBCE] hover:border-[#E8AF30] transition-all duration-200 shadow-xs hover:shadow-sm space-y-3">
                {/* Mobile Date Header */}
                <div className="sm:hidden flex items-center gap-2 text-xs font-patrick text-[#718B55]">
                  <Calendar className="w-3.5 h-3.5 text-[#E8AF30]" />
                  <span>{entry.date}</span>
                </div>

                {/* Author Attribution */}
                {entry.author && (
                  <div className="flex items-center gap-1.5 text-xs text-[#6B584C] font-nunito">
                    <Feather className="w-3 h-3 text-[#E8AF30]" />
                    <span>Penned by</span>
                    {entry.isAnonymous || !entry.author.slug ? (
                      <span className="font-semibold text-[#3B3028]">Anonymous</span>
                    ) : (
                      <Link
                        href={`/authors/${entry.author.slug}`}
                        className="font-semibold text-[#3B3028] hover:text-[#E8AF30] underline-offset-2 hover:underline"
                      >
                        {entry.author.name}
                      </Link>
                    )}
                  </div>
                )}

                {/* Title in Patrick Hand */}
                <h2 className="font-patrick text-2xl sm:text-3xl font-bold text-[#3B3028] group-hover:text-[#E8AF30] transition-colors leading-snug">
                  <Link href={`/journal/${entry.slug}`} className="focus:outline-hidden">
                    {entry.title}
                  </Link>
                </h2>

                {entry.subtitle && (
                  <p className="font-kalam text-sm text-[#718B55]">
                    {entry.subtitle}
                  </p>
                )}

                <p className="font-nunito text-[#3B3028]/90 text-base sm:text-lg leading-relaxed line-clamp-3">
                  {entry.excerpt}
                </p>

                <div className="pt-4 border-t border-[#EADBCE]/70 flex items-center justify-between text-xs text-[#6B584C] font-nunito">
                  <span className="flex items-center gap-1 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-[#718B55]" />
                    {entry.readingTime}
                  </span>

                  <Link
                    href={`/journal/${entry.slug}`}
                    className="font-patrick text-base font-bold text-[#3B3028] group-hover:text-[#E8AF30] inline-flex items-center gap-1 transition-colors"
                  >
                    <span>Read Journal Entry</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 rounded-2xl bg-[#FFF3D9]/30 border border-dashed border-[#EADBCE]">
          <Sparkles className="w-8 h-8 text-[#E8AF30] mx-auto mb-3" />
          <h3 className="font-patrick text-2xl font-bold text-[#3B3028] mb-1">
            No journal entries match your search
          </h3>
          <p className="text-sm text-[#6B584C] font-nunito max-w-sm mx-auto mb-4">
            Try adjusting your search terms or clearing the selected diarist filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedAuthor(null);
            }}
            className="px-4 py-2 rounded-full bg-[#E8AF30] text-[#3B3028] text-sm font-patrick font-semibold hover:bg-[#F4C542] transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
