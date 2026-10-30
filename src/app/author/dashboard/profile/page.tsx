import { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Container } from "@/components/common/Container";
import { ProfileEditor } from "@/components/author/ProfileEditor";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "My Author Profile | My Writing Desk | Sunflower Reverie",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AuthorProfileDashboardPage() {
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

  // Fetch or initialize profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const profileData = profile || {
    id: user.id,
    display_name: user.email?.split("@")[0] || "Author",
    slug: user.email?.split("@")[0]?.toLowerCase().replace(/[^\w-]/g, "") || "author",
    role: "Co-Curator & Author",
    short_bio: "",
    full_bio: "",
    quote: "",
    avatar_url: null,
    social_links: [],
  };

  return (
    <div className="py-12 sm:py-20 bg-[#FFF9EC] min-h-screen text-[#3B3028]">
      <Container className="max-w-4xl">
        <div className="mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#FFF3D9] border border-[#EADBCE] text-xs font-patrick uppercase tracking-widest text-[#718B55]">
            <span>Author Identity</span>
          </div>
          <h1 className="font-caveat text-4xl sm:text-5xl font-bold tracking-tight text-[#3B3028]">
            My Author Profile
          </h1>
          <p className="font-kalam text-lg text-[#6B584C]">
            Manage how your name, biographical thoughts, and handwritten quote appear across the sanctuary.
          </p>
        </div>

        <div className="rounded-3xl border-2 border-[#EADBCE] bg-[#FFF3D9]/70 p-6 sm:p-10 shadow-xs">
          <ProfileEditor initialProfile={profileData} />
        </div>
      </Container>
    </div>
  );
}

