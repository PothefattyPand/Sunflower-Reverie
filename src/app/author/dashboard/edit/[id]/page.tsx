import React, { Suspense } from "react";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { Container } from "@/components/common/Container";
import { WritingEditor } from "@/components/author/WritingEditor";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Edit Writing | My Writing Desk | Sunflower Reverie",
  robots: {
    index: false,
    follow: false,
  },
};

function EditWritingSkeleton() {
  return (
    <div className="py-12 sm:py-20 bg-[#FFF9EC] min-h-screen text-[#3B3028]">
      <Container className="max-w-5xl space-y-8 animate-pulse">
        <div className="space-y-2">
          <div className="h-5 w-32 bg-[#FFF3D9] rounded-full border border-[#EADBCE]" />
          <div className="h-10 w-64 bg-[#FFF3D9] rounded-2xl" />
          <div className="h-4 w-72 bg-[#FFF3D9]/70 rounded-xl" />
        </div>
        <div className="h-96 rounded-3xl border-2 border-[#EADBCE] bg-[#FFF3D9]/60" />
      </Container>
    </div>
  );
}

async function EditWritingContent({ params }: PageProps) {
  await connection();

  if (!isSupabaseConfigured) {
    redirect("/author/login?error=not_configured");
  }

  const { id } = await params;
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

  // Fetch publication and enforce server-side ownership
  const { data: publication, error } = await supabase
    .from("publications")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !publication) {
    notFound();
  }

  // Crucial security check: An author cannot edit another author's publication!
  if (publication.author_id !== user.id) {
    redirect("/author/dashboard");
  }

  return (
    <div className="py-12 sm:py-20 bg-[#FFF9EC] min-h-screen text-[#3B3028]">
      <Container className="max-w-5xl">
        <div className="mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#FFF3D9] border border-[#EADBCE] text-xs font-patrick uppercase tracking-widest text-[#718B55]">
            <span>Editing Manuscript</span>
          </div>
          <h1 className="font-caveat text-4xl sm:text-5xl font-bold tracking-tight text-[#3B3028]">
            Refining Words
          </h1>
          <p className="font-kalam text-lg text-[#6B584C]">
            Tending to &ldquo;{publication.title}&rdquo;
          </p>
        </div>

        <WritingEditor mode="edit" initialData={publication} />
      </Container>
    </div>
  );
}

export default function EditWritingPage({ params }: PageProps) {
  return (
    <Suspense fallback={<EditWritingSkeleton />}>
      <EditWritingContent params={params} />
    </Suspense>
  );
}
