import Link from "next/link";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { Publication } from "@/types";

interface RelatedWritingsProps {
  publications: Publication[];
  currentType: Publication["type"];
}

export function RelatedWritings({ publications, currentType }: RelatedWritingsProps) {
  if (!publications || publications.length === 0) return null;

  const baseHref =
    currentType === "blog"
      ? "/blogs"
      : currentType === "poetry"
      ? "/poetry"
      : currentType === "journal"
      ? "/journal"
      : "/writings";

  return (
    <section className="mt-16 pt-12 border-t border-[#EADBCE]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#718B55] font-nunito block mb-1">
            Further Musings
          </span>
          <h2 className="font-caveat text-3xl sm:text-4xl font-bold text-[#3B3028]">
            Related Readings
          </h2>
        </div>
        <Link
          href={baseHref}
          className="text-sm font-patrick font-semibold text-[#3B3028] hover:text-[#E8AF30] inline-flex items-center gap-1 transition-colors"
        >
          <span>View Archive</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {publications.map((item) => (
          <Link
            key={item.id}
            href={`${baseHref}/${item.slug}`}
            className="group flex flex-col justify-between p-5 rounded-xl bg-[#FFF3D9]/50 hover:bg-[#FFF3D9] border border-[#EADBCE] hover:border-[#E8AF30] transition-all duration-200 shadow-xs hover:shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between text-[11px] text-[#718B55] font-nunito mb-2">
                <span>{item.date}</span>
                {item.readingTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.readingTime}
                  </span>
                )}
              </div>
              <h3 className="font-patrick text-xl font-bold text-[#3B3028] group-hover:text-[#E8AF30] transition-colors line-clamp-2 leading-snug">
                {item.title}
              </h3>
              <p className="font-nunito text-xs text-[#6B584C] line-clamp-2 mt-2 leading-relaxed">
                {item.excerpt}
              </p>
            </div>

            <div className="pt-3 mt-4 border-t border-[#EADBCE]/60 flex items-center justify-between text-sm font-patrick font-semibold text-[#3B3028] group-hover:text-[#E8AF30]">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-[#E8AF30]" />
                Read Piece
              </span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

