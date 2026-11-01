"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Search, Sparkles, Tag, X } from "lucide-react";
import { Publication } from "@/types";

interface AuthorPublicationsListingProps {
  initialPublications: Publication[];
  authorName: string;
}

const ITEMS_PER_PAGE = 6;

type CategoryFilter = "all" | "blog" | "poetry" | "journal" | "writing";

const CATEGORY_TABS: { label: string; value: CategoryFilter }[] = [
  { label: "All Writings", value: "all" },
  { label: "Blogs", value: "blog" },
  { label: "Poetry", value: "poetry" },
  { label: "Journal", value: "journal" },
  { label: "Writings", value: "writing" },
];

export function AuthorPublicationsListing({
  initialPublications,
  authorName,
}: AuthorPublicationsListingProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Extract unique tags for this author
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    initialPublications.forEach((p) => {
      p.tags?.forEach((t) => tagsSet.add(t));
    });
    return Array.from(tagsSet);
  }, [initialPublications]);

  // Filter publications
  const filtered = useMemo(() => {
    return initialPublications.filter((p) => {
      const matchesCategory =
        selectedCategory === "all" || p.type === selectedCategory;

      const matchesSearch =
        searchQuery.trim() === "" ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTag = !selectedTag || p.tags?.includes(selectedTag);

      return matchesCategory && matchesSearch && matchesTag;
    });
  }, [initialPublications, selectedCategory, searchQuery, selectedTag]);

  const displayedPublications = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  if (!initialPublications || initialPublications.length === 0) {
    return (
      <div className="text-center py-20 px-6 rounded-3xl bg-[#FFF3D9]/50 border-2 border-dashed border-[#EADBCE] space-y-4 max-w-xl mx-auto">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#FFF9EC] border border-[#E8AF30] flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-[#E8AF30]" />
        </div>
        <h2 className="font-caveat text-3xl sm:text-4xl font-bold text-[#3B3028]">
          No publications from this author have bloomed yet.
        </h2>
        <p className="font-nunito text-base text-[#6B584C] leading-relaxed">
          {authorName} is currently tending words at the writing desk; return soon to explore published folios beneath the open sky.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 pb-2 border-b border-[#EADBCE]/80">
        {CATEGORY_TABS.map((tab) => {
          const isActive = selectedCategory === tab.value;
          const count =
            tab.value === "all"
              ? initialPublications.length
              : initialPublications.filter((p) => p.type === tab.value).length;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setSelectedCategory(tab.value);
                setVisibleCount(ITEMS_PER_PAGE);
              }}
              className={`px-4 py-2 rounded-full font-patrick text-base font-bold transition-all ${
                isActive
                  ? "bg-[#E8AF30] text-[#3B3028] shadow-xs"
                  : "bg-[#FFF3D9]/60 hover:bg-[#FFF3D9] text-[#6B584C] border border-[#EADBCE]"
              }`}
            >
              <span>{tab.label}</span>
              <span className="ml-2 text-xs font-nunito px-2 py-0.5 rounded-full bg-[#FFF9EC]/80 border border-[#EADBCE]/50">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Tag Filter Box */}
      <div className="p-6 rounded-2xl bg-[#FFF3D9]/60 border border-[#EADBCE] space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B584C]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setVisibleCount(ITEMS_PER_PAGE);
            }}
            placeholder={`Search through ${authorName}'s works...`}
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

        {/* Tag Pills */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#718B55] flex items-center gap-1 mr-1 font-nunito">
              <Tag className="w-3 h-3 text-[#E8AF30]" />
              Themes:
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedTag(null);
                setVisibleCount(ITEMS_PER_PAGE);
              }}
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
                onClick={() => {
                  setSelectedTag(selectedTag === tag ? null : tag);
                  setVisibleCount(ITEMS_PER_PAGE);
                }}
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

      {/* Publications Grid */}
      {displayedPublications.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {displayedPublications.map((item) => {
            const catPath = item.type === "blog" ? "blogs" : item.type === "writing" ? "writings" : item.type;
            const href = `/${catPath}/${item.slug}`;

            return (
              <article
                key={item.id}
                className="group flex flex-col justify-between rounded-2xl bg-[#FFF9EC] border border-[#EADBCE] hover:border-[#E8AF30] p-7 transition-all duration-300 shadow-xs hover:shadow-md"
              >
                <div className="space-y-3">
                  {/* Meta Header */}
                  <div className="flex items-center justify-between text-xs text-[#718B55] font-nunito font-semibold">
                    <span className="uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFF3D9] border border-[#EADBCE] font-patrick">
                      {item.type}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-[#6B584C]">{item.date}</span>
                      {item.readingTime && (
                        <span className="flex items-center gap-1 text-[#6B584C]">
                          <Clock className="w-3.5 h-3.5 text-[#E8AF30]" />
                          {item.readingTime}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-patrick text-2xl sm:text-3xl font-bold text-[#3B3028] group-hover:text-[#E8AF30] transition-colors leading-snug">
                    <Link href={href} className="focus:outline-hidden">
                      {item.title}
                    </Link>
                  </h3>

                  {/* Subtitle if available */}
                  {item.subtitle && (
                    <p className="font-kalam text-base text-[#718B55] font-semibold">
                      {item.subtitle}
                    </p>
                  )}

                  {/* Excerpt */}
                  <p className="font-nunito text-[#3B3028]/90 text-base leading-relaxed line-clamp-3">
                    {item.excerpt}
                  </p>

                  {/* Tags */}
                  {item.tags && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {item.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[11px] font-nunito font-bold px-2 py-0.5 rounded-md bg-[#FFF3D9] text-[#6B584C] border border-[#EADBCE]/80"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action */}
                <div className="pt-6 mt-6 border-t border-[#EADBCE]/70 flex items-center justify-between text-base font-patrick font-semibold text-[#3B3028] group-hover:text-[#E8AF30] transition-colors">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#E8AF30]" />
                    Read Piece
                  </span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-6 rounded-2xl bg-[#FFF3D9]/30 border border-dashed border-[#EADBCE]">
          <Sparkles className="w-8 h-8 text-[#E8AF30] mx-auto mb-3" />
          <h3 className="font-patrick text-2xl font-bold text-[#3B3028] mb-1">
            No writings match your criteria
          </h3>
          <p className="text-sm text-[#6B584C] font-nunito max-w-sm mx-auto mb-4">
            Try choosing another category or clearing your current filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
              setSelectedTag(null);
            }}
            className="px-4 py-2 rounded-full bg-[#E8AF30] text-[#3B3028] text-sm font-patrick font-semibold hover:bg-[#F4C542] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Pagination */}
      {hasMore && (
        <div className="text-center pt-6">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FFF3D9] hover:bg-[#F4C542]/30 border border-[#EADBCE] hover:border-[#E8AF30] text-base font-patrick font-semibold text-[#3B3028] shadow-xs transition-all"
          >
            <span>Load More Writings ({filtered.length - visibleCount} remaining)</span>
            <ArrowRight className="w-4 h-4 text-[#E8AF30]" />
          </button>
        </div>
      )}
    </div>
  );
}

