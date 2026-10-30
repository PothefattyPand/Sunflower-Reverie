import { type NextRequest, NextResponse } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_REDIRECT_PATHS = [
  "/author/reset-password",
  "/author/dashboard",
  "/author/dashboard/settings",
  "/author/dashboard/profile",
  "/author/dashboard/new",
];

function getSafeRedirectPath(candidate: string | null, defaultPath: string): string {
  if (!candidate) {
    return defaultPath;
  }

  // Exact allowlist match
  if (ALLOWED_REDIRECT_PATHS.includes(candidate)) {
    return candidate;
  }

  // Strict internal path check: must start with /author/, no double slashes, no backslashes
  if (
    candidate.startsWith("/author/") &&
    !candidate.startsWith("//") &&
    !candidate.includes("\\") &&
    !candidate.includes("://")
  ) {
    return candidate;
  }

  return defaultPath;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const origin = request.nextUrl.origin;

  // Check for error parameters returned from Supabase Auth
  const errorParam = searchParams.get("error");
  if (errorParam) {
    return NextResponse.redirect(new URL("/author/login?error=recovery_failed", origin));
  }

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const nextCandidate = searchParams.get("next");

  // Determine appropriate fallback destination
  const isRecovery = type === "recovery" || nextCandidate === "/author/reset-password";
  const defaultDestination = isRecovery ? "/author/reset-password" : "/author/dashboard";
  const destination = getSafeRedirectPath(nextCandidate, defaultDestination);

  // 1. PKCE Authorization Code Exchange (Default in modern Supabase SSR)
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      // Gracefully redirect without exposing authorization code or error payload
      return NextResponse.redirect(new URL("/author/login?error=recovery_failed", origin));
    }

    return NextResponse.redirect(new URL(destination, origin));
  }

  // 2. Token Hash Verification (Supported for token_hash email templates)
  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (error) {
      return NextResponse.redirect(new URL("/author/login?error=recovery_failed", origin));
    }

    return NextResponse.redirect(new URL(destination, origin));
  }

  // Neither valid PKCE code nor token_hash provided
  return NextResponse.redirect(new URL("/author/login?error=recovery_failed", origin));
}

