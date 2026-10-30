import React, { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import {
  BookOpen,
  Calendar,
  Clock,
  Edit,
  ExternalLink,
  Feather,
  FilePlus,
  FileText,
  LogOut,
  Settings,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { Container } from "@/components/common/Container";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { logoutAuthorAction } from "@/app/author/actions";
import { DeleteConfirmModal } from "@/components/author/DeleteConfirmModal";
import { PublishToggle } from "@/components/author/PublishToggle";
import DashboardLoading from "./loading";

export const metadata: Metadata = {
  title: "My Writing Desk | Author Portal | Sunflower Reverie",
  robots: {
    index: false,
    follow: false,
  },
};

function formatDisplayDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
  } catch {
    return "";
  }
}

async function AuthorDashboardContent() {
  await connection();

  if (!isSupabaseConfigured) {
    redirect("/author/login?error=not_configured");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/author/login");
  }

  // Check allowlist
  const { data: authorized } = await supabase
    .from("authorized_authors")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!authorized) {
    redirect("/author/login?error=unauthorized");
  }

  // Fetch author profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // Fetch ONLY this author's publications
  const { data: publications } = await supabase
    .from("publications")
    .select("*")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });

  const myPieces = publications || [];
  const publishedPieces = myPieces.filter((p) => p.status === "published");
  const draftPieces = myPieces.filter((p) => p.status === "draft");
  const authorName = profile?.display_name || user.email?.split("@")[0] || "Author";

  return (
    <div className="py-10 sm:py-16 bg-[#FFF9EC] min-h-screen text-[#3B3028]">
      <Container className="max-w-6xl space-y-10">
        {/* Desk Header & Botanical Welcome */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#EADBCE]">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFF3D9] border border-[#EADBCE] text-xs font-patrick uppercase tracking-widest text-[#718B55]">
              <Feather className="w-3.5 h-3.5 text-[#E8AF30]" />
              <span>Private Writing Cabinet</span>
            </div>

            <h1 className="font-caveat text-4xl sm:text-6xl font-bold tracking-tight text-[#3B3028] leading-[1.05]">
              My Writing Desk
            </h1>

            <p className="font-kalam text-lg sm:text-xl text-[#6B584C] leading-relaxed">
              Welcome back, <span className="text-[#3B3028] font-bold">{authorName}</span>. Your personal manuscripts and seasonal reflections are gathered here beneath the quiet light.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <Link
              href="/author/dashboard/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#E8AF30] hover:bg-[#F4C542] text-[#3B3028] font-patrick text-base font-bold shadow-xs hover:shadow-md transition-all group"
            >
              <FilePlus className="w-4 h-4 text-[#3B3028]" />
              <span>New Writing</span>
            </Link>

            <Link
              href="/author/dashboard/profile"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#FFF3D9] hover:bg-[#FFF9EC] border border-[#EADBCE] text-sm font-patrick font-bold text-[#3B3028] transition-colors"
            >
              <UserCheck className="w-4 h-4 text-[#718B55]" />
              <span>My Profile</span>
            </Link>

            <Link
              href="/author/dashboard/settings"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#FFF3D9] hover:bg-[#FFF9EC] border border-[#EADBCE] text-sm font-patrick font-bold text-[#3B3028] transition-colors"
            >
              <Settings className="w-4 h-4 text-[#6B584C]" />
              <span>Settings</span>
            </Link>

            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#FFF3D9] hover:bg-[#FFF9EC] border border-[#EADBCE] text-sm font-patrick font-bold text-[#6B584C] hover:text-[#3B3028] transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-[#E8AF30]" />
              <span>View Sanctuary</span>
            </Link>

            <form action={logoutAuthorAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#FFF3D9] hover:bg-amber-100 border border-[#EADBCE] text-sm font-patrick font-bold text-[#6B584C] hover:text-red-700 transition-colors cursor-pointer"
                title="Log out of writer portal"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </form>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#EADBCE]/60 text-sm font-patrick font-bold">
          <Link
            href="/author/dashboard"
            className="px-4 py-1.5 rounded-full bg-[#3B3028] text-[#FFF9EC] transition-colors"
          >
            Folios Overview
          </Link>
          <Link
            href="/author/dashboard/new"
            className="px-4 py-1.5 rounded-full bg-[#FFF3D9] hover:bg-[#FFF9EC] text-[#6B584C] hover:text-[#3B3028] border border-[#EADBCE] transition-colors"
          >
            + Compose Writing
          </Link>
          <Link
            href="/author/dashboard/profile"
            className="px-4 py-1.5 rounded-full bg-[#FFF3D9] hover:bg-[#FFF9EC] text-[#6B584C] hover:text-[#3B3028] border border-[#EADBCE] transition-colors"
          >
            Author Notebook &amp; Bio
          </Link>
          <Link
            href="/author/dashboard/settings"
            className="px-4 py-1.5 rounded-full bg-[#FFF3D9] hover:bg-[#FFF9EC] text-[#6B584C] hover:text-[#3B3028] border border-[#EADBCE] transition-colors"
          >
            Security &amp; Password
          </Link>
        </div>

        {/* Overview Stats (Accurate database counts) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-[#FFF3D9]/90 border border-[#EADBCE] space-y-1 shadow-xs hover:border-[#E8AF30]/60 transition-colors">
            <span className="text-xs font-patrick uppercase tracking-widest text-[#718B55] flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#E8AF30]" />
              Published Writings
            </span>
            <p className="font-caveat text-4xl sm:text-5xl font-bold text-[#3B3028]">
              {publishedPieces.length}
            </p>
            <p className="text-xs font-nunito text-[#6B584C]">
              Freely readable by sanctuary visitors
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#FFF3D9]/90 border border-[#EADBCE] space-y-1 shadow-xs hover:border-[#E8AF30]/60 transition-colors">
            <span className="text-xs font-patrick uppercase tracking-widest text-[#718B55] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#E8AF30]" />
              Private Drafts
            </span>
            <p className="font-caveat text-4xl sm:text-5xl font-bold text-[#3B3028]">
              {draftPieces.length}
            </p>
            <p className="text-xs font-nunito text-[#6B584C]">
              Unpublished and visible only to you
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#FFF3D9]/90 border border-[#EADBCE] space-y-1 shadow-xs hover:border-[#E8AF30]/60 transition-colors">
            <span className="text-xs font-patrick uppercase tracking-widest text-[#718B55] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#E8AF30]" />
              Total Manuscripts
            </span>
            <p className="font-caveat text-4xl sm:text-5xl font-bold text-[#3B3028]">
              {myPieces.length}
            </p>
            <p className="text-xs font-nunito text-[#6B584C]">
              Tended under your personal author ID
            </p>
          </div>
        </div>

        {/* SECTION 1: My Drafts */}
        <section className="space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#EADBCE]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E8AF30]" />
              <h2 className="font-patrick text-2xl sm:text-3xl font-bold text-[#3B3028]">
                My Drafts ({draftPieces.length})
              </h2>
            </div>
            <Link
              href="/author/dashboard/new"
              className="text-xs font-patrick font-bold text-[#E8AF30] hover:text-[#3B3028] transition-colors"
            >
              + Create New Draft
            </Link>
          </div>

          {draftPieces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {draftPieces.map((piece) => (
                <div
                  key={piece.id}
                  className="rounded-3xl border border-dashed border-[#EADBCE] bg-[#FFF3D9]/60 hover:bg-[#FFF3D9] p-6 flex flex-col justify-between space-y-4 hover:border-[#E8AF30] transition-all shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-patrick text-[#718B55]">
                      <span className="uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFF9EC] border border-[#EADBCE] font-bold">
                        {piece.category}
                      </span>
                      <span className="italic text-[#6B584C]">In Progress</span>
                    </div>

                    <h3 className="font-patrick text-2xl font-bold text-[#3B3028] leading-snug">
                      {piece.title}
                    </h3>

                    {piece.subtitle && (
                      <p className="font-kalam text-sm text-[#6B584C]">
                        {piece.subtitle}
                      </p>
                    )}

                    <p className="font-nunito text-xs text-[#3B3028]/80 line-clamp-3 leading-relaxed">
                      {piece.excerpt}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#EADBCE]/70 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/author/dashboard/edit/${piece.id}`}
                        className="inline-flex items-center gap-1 text-xs font-patrick font-bold text-[#3B3028] hover:text-[#E8AF30] p-1.5 rounded-lg border border-[#EADBCE] bg-[#FFF9EC] transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>
                      <DeleteConfirmModal
                        publicationId={piece.id}
                        publicationTitle={piece.title}
                      />
                    </div>

                    <PublishToggle
                      publicationId={piece.id}
                      currentStatus="draft"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center rounded-3xl bg-[#FFF3D9]/40 border border-dashed border-[#EADBCE] space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#FFF9EC] border border-[#EADBCE] flex items-center justify-center">
                <Feather className="w-5 h-5 text-[#E8AF30]" />
              </div>
              <p className="font-patrick text-xl text-[#3B3028]">
                Your desk is tidy. No unwritten drafts in progress.
              </p>
              <p className="font-nunito text-xs text-[#6B584C] max-w-md mx-auto">
                Ready to draft an essay, compose a poem, or write a new journal entry?
              </p>
              <div className="pt-2">
                <Link
                  href="/author/dashboard/new"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#E8AF30] hover:bg-[#F4C542] text-[#3B3028] font-patrick text-sm font-bold transition-all shadow-xs"
                >
                  <FilePlus className="w-4 h-4" />
                  <span>Begin a New Draft</span>
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* SECTION 2: My Published Writings */}
        <section className="space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#EADBCE]">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#718B55]" />
              <h2 className="font-patrick text-2xl sm:text-3xl font-bold text-[#3B3028]">
                My Published Writings ({publishedPieces.length})
              </h2>
            </div>
          </div>

          {publishedPieces.length > 0 ? (
            <div className="divide-y divide-[#EADBCE] rounded-3xl bg-[#FFF3D9]/60 border border-[#EADBCE] p-6 sm:p-8 shadow-xs">
              {publishedPieces.map((piece) => {
                const catPath = piece.category === "writing" ? "writings" : piece.category;
                const publicHref = `/${catPath}/${piece.slug}`;
                const displayDate = formatDisplayDate(piece.published_at || piece.created_at);

                return (
                  <div
                    key={piece.id}
                    className="py-5 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 md:max-w-2xl">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#718B55] font-patrick">
                        <span className="uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#FFF9EC] border border-[#EADBCE] font-bold">
                          {piece.category}
                        </span>
                        {displayDate && (
                          <span className="flex items-center gap-1 text-[#6B584C] font-nunito">
                            <Calendar className="w-3 h-3 text-[#E8AF30]" />
                            {displayDate}
                          </span>
                        )}
                        {piece.reading_time && (
                          <span className="flex items-center gap-1 text-[#6B584C] font-nunito">
                            <Clock className="w-3 h-3 text-[#718B55]" />
                            {piece.reading_time}
                          </span>
                        )}
                      </div>

                      <h3 className="font-patrick text-2xl font-bold text-[#3B3028]">
                        <Link
                          href={publicHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#E8AF30] transition-colors inline-flex items-center gap-1.5"
                        >
                          <span>{piece.title}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-[#6B584C]/60" />
                        </Link>
                      </h3>

                      <p className="font-nunito text-xs text-[#3B3028]/80 line-clamp-2 leading-relaxed">
                        {piece.excerpt}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
                      <Link
                        href={`/author/dashboard/edit/${piece.id}`}
                        className="inline-flex items-center gap-1 text-xs font-patrick font-bold text-[#3B3028] hover:text-[#E8AF30] px-3 py-1.5 rounded-lg border border-[#EADBCE] bg-[#FFF9EC] transition-colors shadow-2xs"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>

                      <PublishToggle
                        publicationId={piece.id}
                        currentStatus="published"
                      />

                      <DeleteConfirmModal
                        publicationId={piece.id}
                        publicationTitle={piece.title}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-10 text-center rounded-3xl bg-[#FFF3D9]/40 border border-dashed border-[#EADBCE] space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#FFF9EC] border border-[#EADBCE] flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-[#718B55]" />
              </div>
              <p className="font-patrick text-xl text-[#3B3028]">
                No published manuscripts in the public sanctuary yet.
              </p>
              <p className="font-nunito text-xs text-[#6B584C] max-w-md mx-auto">
                Once you finish composing and publish a draft, readers can freely explore it from your public author folio.
              </p>
              <div className="pt-2">
                <Link
                  href="/author/dashboard/new"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#E8AF30] hover:bg-[#F4C542] text-[#3B3028] font-patrick text-sm font-bold transition-all shadow-xs"
                >
                  <FilePlus className="w-4 h-4" />
                  <span>Publish Your First Piece</span>
                </Link>
              </div>
            </div>
          )}
        </section>
      </Container>
    </div>
  );
}

export default function AuthorDashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <AuthorDashboardContent />
    </Suspense>
  );
}
