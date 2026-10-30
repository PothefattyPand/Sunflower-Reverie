import Link from "next/link";
import { ArrowRight, BookOpen, Feather, FileText, Sparkles } from "lucide-react";
import { Container } from "@/components/common/Container";

interface CategoryItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  badge: string;
  icon: "feather" | "book" | "sparkles" | "file";
  accentColor: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: "cat-blogs",
    title: "Blogs",
    subtitle: "Reflections & Perspectives",
    description: "Conversations on the creative life, books read beneath the shade, and thoughts on mindful living.",
    href: "/blogs",
    badge: "Dispatches",
    icon: "sparkles",
    accentColor: "#F4C542",
  },
  {
    id: "cat-poetry",
    title: "Poetry",
    subtitle: "Cadences & Stanzas",
    description: "Verses written in celebration of the changing seasons, quiet twilights, and the warm resilience of sunflowers.",
    href: "/poetry",
    badge: "Lyrical",
    icon: "feather",
    accentColor: "#E8AF30",
  },
  {
    id: "cat-journal",
    title: "Journal",
    subtitle: "Daily Field Notes",
    description: "Intimate and unhurried fragments from the author's notebook; recording the light, shadows, and daily joys.",
    href: "/journal",
    badge: "Chronicles",
    icon: "book",
    accentColor: "#718B55",
  },
  {
    id: "cat-writings",
    title: "Writings",
    subtitle: "Selected Prose & Essays",
    description: "Narrative explorations, memoirs, and storytelling intended for cheerful and contemplative reading.",
    href: "/writings",
    badge: "Anthology",
    icon: "file",
    accentColor: "#D99419",
  },
];

export function CategoryCard() {
  return (
    <section className="py-20 sm:py-28 bg-[#FFF9EC] border-b border-[#EADBCE]/60">
      <Container className="max-w-6xl">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-18 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFF3D9] border border-[#EADBCE] text-xs uppercase tracking-widest text-[#718B55] font-patrick">
            <span>Section 3 • Paths of Exploration</span>
          </div>
          {/* Caveat Section Heading */}
          <h2 className="font-caveat text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#3B3028] leading-[1.05]">
            Explore the Garden of Words
          </h2>
          <p className="font-nunito text-base sm:text-lg text-[#6B584C]">
            Each path offers a distinct mood and literary form. Step into the grove that calls to you today.
          </p>
        </div>

        {/* 4 Interactive Category Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {CATEGORIES.map((cat) => {
            const IconComponent =
              cat.icon === "feather"
                ? Feather
                : cat.icon === "book"
                ? BookOpen
                : cat.icon === "sparkles"
                ? Sparkles
                : FileText;

            return (
              <Link
                key={cat.id}
                href={cat.href}
                className="group relative flex flex-col justify-between rounded-2xl bg-[#FFF3D9]/60 hover:bg-[#FFF3D9] border-2 border-[#EADBCE] hover:border-[#E8AF30] p-6 sm:p-7 shadow-xs hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1.5 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#E8AF30]"
              >
                {/* Botanical Corner Glow */}
                <div
                  className="absolute top-0 right-0 w-24 h-24 rounded-tr-2xl bg-gradient-to-bl from-[#F4C542]/20 to-transparent pointer-events-none"
                  aria-hidden="true"
                />

                <div>
                  {/* Icon & Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[#FFF9EC] border border-[#EADBCE] flex items-center justify-center group-hover:scale-110 group-hover:border-[#E8AF30] transition-all duration-300 shadow-xs">
                      <IconComponent className="w-6 h-6 text-[#3B3028]" />
                    </div>
                    <span className="text-xs font-patrick uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFF9EC] border border-[#EADBCE] text-[#718B55]">
                      {cat.badge}
                    </span>
                  </div>

                  {/* Category Title in Patrick Hand */}
                  <h3 className="font-patrick text-2xl sm:text-3xl font-bold text-[#3B3028] group-hover:text-[#E8AF30] transition-colors mb-1">
                    {cat.title}
                  </h3>
                  {/* Kalam Subtitle */}
                  <p className="font-kalam text-sm text-[#718B55] mb-3">
                    {cat.subtitle}
                  </p>

                  {/* Description in Nunito */}
                  <p className="font-nunito text-xs sm:text-sm text-[#3B3028]/85 leading-relaxed mb-6">
                    {cat.description}
                  </p>
                </div>

                {/* Footer link indicator in Patrick Hand */}
                <div className="pt-4 border-t border-[#EADBCE]/70 flex items-center justify-between text-base font-patrick font-bold text-[#3B3028] group-hover:text-[#E8AF30] transition-colors">
                  <span>Enter Collection</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
