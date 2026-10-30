"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getBaseUrl } from "@/lib/utils";

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

/**
 * Request password reset email for an author (Public / Unauthenticated)
 * Always displays a neutral confirmation to prevent email enumeration.
 */
export async function requestPasswordResetPublicAction(
  _prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  if (!isSupabaseConfigured) {
    return {
      error:
        "Supabase backend configuration is pending. Please verify your environment variables.",
    };
  }

  const email = (formData.get("email") as string)?.trim().toLowerCase();

  if (!email) {
    return { error: "Please provide your registered author email address." };
  }

  const supabase = await createClient();
  const siteUrl = getBaseUrl();

  try {
    // Trigger Supabase Auth password recovery with redirect to /auth/callback?next=/author/reset-password
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/callback?next=/author/reset-password`,
    });

    if (error) {
      console.warn("[Auth] Password reset notice recorded");
    }
  } catch {
    // Handled silently to prevent email enumeration
  }

  // Always return success to prevent email enumeration
  return { success: true };
}

/**
 * Update the password for an author in a valid recovery session
 */
export async function resetPasswordAction(
  _prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  if (!isSupabaseConfigured) {
    return {
      error: "Supabase backend configuration is pending.",
    };
  }

  const password = (formData.get("password") as string);
  const confirmPassword = (formData.get("confirmPassword") as string);

  if (!password || !confirmPassword) {
    return { error: "Please enter and confirm your new secret password." };
  }

  if (password.length < 8) {
    return { error: "Your new password must be at least 8 characters in length." };
  }

  if (password !== confirmPassword) {
    return { error: "The entered passwords do not match. Please verify and try again." };
  }

  const supabase = await createClient();

  // Verify that a valid authenticated session exists from the recovery link
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error:
        "Your recovery session has expired or is invalid. Please request a new recovery link.",
    };
  }

  // Enforce two-author allowlist: Only approved authors may update credentials
  const { data: authorized, error: authCheckError } = await supabase
    .from("authorized_authors")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (authCheckError || !authorized) {
    await supabase.auth.signOut();
    return {
      error:
        "Access denied. This account is not one of the two authorized co-curators for Sunflower Reverie.",
    };
  }

  // Update password in Supabase Auth
  const { error: updateError } = await supabase.auth.updateUser({
    password,
  });

  if (updateError) {
    return {
      error: updateError.message || "Failed to update password. Please try again.",
    };
  }

  // Sign out of recovery session so author logs in cleanly with new credentials
  await supabase.auth.signOut();

  revalidatePath("/author/login");
  revalidatePath("/author/dashboard", "layout");
  return { success: true };
}
