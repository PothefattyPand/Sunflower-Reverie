import React, { Suspense } from "react";

export const instant = false;

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#FFF9EC] py-12 sm:py-20 text-[#3B3028]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
        <div className="h-8 w-48 bg-[#FFF3D9] rounded-full" />
        <div className="h-14 w-80 bg-[#FFF3D9] rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="h-32 bg-[#FFF3D9]/70 rounded-2xl border border-[#EADBCE]" />
          <div className="h-32 bg-[#FFF3D9]/70 rounded-2xl border border-[#EADBCE]" />
          <div className="h-32 bg-[#FFF3D9]/70 rounded-2xl border border-[#EADBCE]" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<DashboardSkeleton />}>{children}</Suspense>;
}
