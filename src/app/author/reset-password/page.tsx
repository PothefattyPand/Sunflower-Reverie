import { Suspense } from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Container } from "@/components/common/Container";
import { ResetPasswordForm } from "@/components/author/ResetPasswordForm";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Reset Password | Author Portal | Sunflower Reverie",
  description: "Set a new secret password for the Sunflower Reverie author account.",
  robots: {
    index: false,
    follow: false,
  },
};

function ResetPasswordSkeleton() {
  return (
    <div className="text-center p-8 font-patrick text-lg text-[#6B584C]">
      Verifying Recovery Session...
    </div>
  );
}

async function ResetPasswordContent() {
  await connection();

  if (!isSupabaseConfigured) {
    redirect("/author/login?error=not_configured");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If no recovery session exists, redirect to login
  if (!user) {
    redirect("/author/login?error=session_required");
  }

  // Enforce author allowlist: only approved authors can reset passwords
  const { data: authorized } = await supabase
    .from("authorized_authors")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!authorized) {
    await supabase.auth.signOut();
    redirect("/author/login?error=unauthorized");
  }

  return <ResetPasswordForm />;
}

export default function ResetPasswordPage() {
  return (
    <div className="py-16 sm:py-24 bg-[#FFF9EC] min-h-[80vh] flex items-center">
      <Container className="max-w-md">
        <Suspense fallback={<ResetPasswordSkeleton />}>
          <ResetPasswordContent />
        </Suspense>
      </Container>
    </div>
  );
}

