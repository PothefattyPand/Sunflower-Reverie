import { Feather, Sparkles } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="py-10 sm:py-16 bg-[#FFF9EC] min-h-screen text-[#3B3028]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#EADBCE]">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFF3D9] border border-[#EADBCE] text-xs font-patrick uppercase tracking-widest text-[#718B55]">
              <Feather className="w-3.5 h-3.5 text-[#E8AF30]" />
              <span>Private Writing Cabinet</span>
            </div>
            <div className="h-12 w-72 bg-[#FFF3D9] rounded-2xl border border-[#EADBCE]/50" />
            <div className="h-5 w-96 max-w-full bg-[#FFF3D9]/70 rounded-xl" />
          </div>

          {/* Action Toolbar Skeleton */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <div className="h-10 w-32 bg-[#E8AF30]/40 rounded-full" />
            <div className="h-10 w-28 bg-[#FFF3D9] rounded-full border border-[#EADBCE]" />
            <div className="h-10 w-28 bg-[#FFF3D9] rounded-full border border-[#EADBCE]" />
            <div className="h-10 w-28 bg-[#FFF3D9] rounded-full border border-[#EADBCE]" />
          </div>
        </div>

        {/* Navigation Tabs Skeleton */}
        <div className="flex items-center gap-2 pb-2 border-b border-[#EADBCE]/60">
          <div className="h-8 w-28 bg-[#3B3028]/20 rounded-full" />
          <div className="h-8 w-32 bg-[#FFF3D9] rounded-full border border-[#EADBCE]" />
          <div className="h-8 w-36 bg-[#FFF3D9] rounded-full border border-[#EADBCE]" />
          <div className="h-8 w-32 bg-[#FFF3D9] rounded-full border border-[#EADBCE]" />
        </div>

        {/* 3 Statistics Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1, 2, 3].map((card) => (
            <div
              key={card}
              className="p-6 rounded-3xl bg-[#FFF3D9]/90 border border-[#EADBCE] space-y-2 shadow-xs"
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E8AF30]" />
                <div className="h-3.5 w-24 bg-[#EADBCE]/60 rounded-full" />
              </div>
              <div className="h-10 w-16 bg-[#EADBCE]/70 rounded-xl" />
              <div className="h-3 w-40 bg-[#EADBCE]/50 rounded-full" />
            </div>
          ))}
        </div>

        {/* Drafts Section Skeleton */}
        <div className="space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#EADBCE]">
            <div className="h-7 w-44 bg-[#FFF3D9] rounded-xl" />
            <div className="h-4 w-28 bg-[#FFF3D9] rounded-lg" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-dashed border-[#EADBCE] bg-[#FFF3D9]/60 p-6 space-y-4"
              >
                <div className="flex justify-between items-center">
                  <div className="h-5 w-20 bg-[#FFF9EC] rounded-full border border-[#EADBCE]" />
                  <div className="h-4 w-16 bg-[#FFF9EC] rounded-full" />
                </div>
                <div className="h-7 w-3/4 bg-[#EADBCE]/60 rounded-xl" />
                <div className="space-y-2">
                  <div className="h-3.5 w-full bg-[#EADBCE]/40 rounded-full" />
                  <div className="h-3.5 w-5/6 bg-[#EADBCE]/40 rounded-full" />
                </div>
                <div className="pt-3 border-t border-[#EADBCE]/70 flex justify-between">
                  <div className="h-8 w-16 bg-[#FFF9EC] rounded-lg border border-[#EADBCE]" />
                  <div className="h-8 w-24 bg-[#FFF9EC] rounded-lg border border-[#EADBCE]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Published Manuscripts Section Skeleton */}
        <div className="space-y-5">
          <div className="pb-3 border-b border-[#EADBCE]">
            <div className="h-7 w-52 bg-[#FFF3D9] rounded-xl" />
          </div>

          <div className="rounded-3xl bg-[#FFF3D9]/60 border border-[#EADBCE] p-6 sm:p-8 space-y-6">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 last:pb-0 border-b last:border-b-0 border-[#EADBCE]/60"
              >
                <div className="space-y-2 max-w-xl w-full">
                  <div className="h-4 w-24 bg-[#FFF9EC] rounded-full border border-[#EADBCE]" />
                  <div className="h-6 w-2/3 bg-[#EADBCE]/60 rounded-xl" />
                  <div className="h-3.5 w-full bg-[#EADBCE]/40 rounded-full" />
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-16 bg-[#FFF9EC] rounded-lg border border-[#EADBCE]" />
                  <div className="h-8 w-20 bg-[#FFF9EC] rounded-lg border border-[#EADBCE]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

