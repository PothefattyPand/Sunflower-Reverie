import React, { Suspense } from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Container } from "@/components/common/Container";
import { AccountSettings } from "@/components/author/AccountSettings";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Account Settings | My Writing Desk | Sunflower Reverie",
  robots: {
    index: false,
    follow: false,
  },
};

function SettingsSkeleton() {
  return (
    <div className="py-12 sm:py-20 bg-[#FFF9EC] min-h-screen text-[#3B3028]">
      <Container className="max-w-4xl space-y-8 animate-pulse">
        <div className="space-y-2">
          <div className="h-5 w-32 bg-[#FFF3D9] rounded-full border border-[#EADBCE]" />
          <div className="h-10 w-64 bg-[#FFF3D9] rounded-2xl" />
          <div className="h-4 w-96 max-w-full bg-[#FFF3D9]/70 rounded-xl" />
        </div>
        <div className="h-80 rounded-3xl border-2 border-[#EADBCE] bg-[#FFF3D9]/60" />
      </Container>
    </div>
  );
}

async function AccountSettingsContent() {
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
      <Container className="max-w-4xl">
        <div className="mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#FFF3D9] border border-[#EADBCE] text-xs font-patrick uppercase tracking-widest text-[#718B55]">
            <span>Account &amp; Security</span>
          </div>
          <h1 className="font-caveat text-4xl sm:text-5xl font-bold tracking-tight text-[#3B3028]">
            Author Security Settings
          </h1>
          <p className="font-kalam text-lg text-[#6B584C]">
            Manage your credentials, change your password, or review your verified editorial status.
          </p>
        </div>

        <div className="rounded-3xl border-2 border-[#EADBCE] bg-[#FFF3D9]/70 p-6 sm:p-10 shadow-xs">
          <AccountSettings userEmail={user.email || ""} />
        </div>
      </Container>
    </div>
  );
}

export default function AccountSettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <AccountSettingsContent />
    </Suspense>
  );
}
