"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export interface AuthState {
  error?: string;
  success?: boolean;
}

/**
 * Log in an authorized author
 */
export async function loginAuthorAction(
  _prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  if (!isSupabaseConfigured) {
    return {
      error:
        "Supabase is not yet configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.",
    };
  }

  const email = (formData.get("email") as string)?.trim();
  const password = (formData.get("password") as string);

  if (!email || !password) {
    return { error: "Please provide both email and password." };
  }

  const supabase = await createClient();

  // Attempt login with Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: error?.message || "Invalid email or password." };
  }

  // Verify server-controlled authorization allowlist
  const { data: authorized, error: authCheckError } = await supabase
    .from("authorized_authors")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (authCheckError || !authorized) {
    // Force sign out immediately if account is not allowlisted
    await supabase.auth.signOut();
    return {
      error:
        "Access denied. This account is not one of the two authorized co-curators for Sunflower Reverie.",
    };
  }

  revalidatePath("/author/dashboard", "layout");
  redirect("/author/dashboard");
}

/**
 * Log out the currently authenticated author
 */
export async function logoutAuthorAction(): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/author/login");
}

