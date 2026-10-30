import React, { Suspense } from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Container } from "@/components/common/Container";
import { WritingEditor } from "@/components/author/WritingEditor";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "New Writing | My Writing Desk | Sunflower Reverie",
  robots: {
    index: false,
    follow: false,
  },
};

function NewWritingSkeleton() {
  return (
    <div className="py-12 sm:py-20 bg-[#FFF9EC] min-h-screen text-[#3B3028]">
      <Container className="max-w-5xl space-y-8 animate-pulse">
        <div className="space-y-2">
          <div className="h-5 w-32 bg-[#FFF3D9] rounded-full border border-[#EADBCE]" />
          <div className="h-10 w-64 bg-[#FFF3D9] rounded-2xl" />
          <div className="h-4 w-80 bg-[#FFF3D9]/70 rounded-xl" />
        </div>
        <div className="h-96 rounded-3xl border-2 border-[#EADBCE] bg-[#FFF3D9]/60" />
      </Container>
    </div>
  );
}

async function NewWritingContent() {
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

  return (
    <div className="py-12 sm:py-20 bg-[#FFF9EC] min-h-screen text-[#3B3028]">
      <Container className="max-w-5xl">
        <div className="mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#FFF3D9] border border-[#EADBCE] text-xs font-patrick uppercase tracking-widest text-[#718B55]">
            <span>Fresh Manuscript</span>
          </div>
          <h1 className="font-caveat text-4xl sm:text-5xl font-bold tracking-tight text-[#3B3028]">
            Begin a New Piece
          </h1>
          <p className="font-kalam text-lg text-[#6B584C]">
            Shape your thoughts into verse, reflection, or essay.
          </p>
        </div>

        <WritingEditor mode="create" />
      </Container>
    </div>
  );
}

export default function NewWritingPage() {
  return (
    <Suspense fallback={<NewWritingSkeleton />}>
      <NewWritingContent />
    </Suspense>
  );
}
