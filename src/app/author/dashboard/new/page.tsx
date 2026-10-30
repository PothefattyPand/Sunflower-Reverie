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

export default async function NewWritingPage() {
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

