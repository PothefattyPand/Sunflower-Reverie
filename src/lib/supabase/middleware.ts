import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseUrl, supabaseAnonKey, isSupabaseConfigured } from "./env";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // If Supabase is not configured yet, allow viewing public pages, but inform on dashboard
  if (!isSupabaseConfigured) {
    if (request.nextUrl.pathname.startsWith("/author/dashboard")) {
      const url = request.nextUrl.clone();
      url.pathname = "/author/login";
      url.searchParams.set("error", "not_configured");
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protect /author/reset-password: only allow users with active recovery/auth session
  if (pathname === "/author/reset-password") {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/author/login";
      url.searchParams.set("error", "session_required");
      return NextResponse.redirect(url);
    }
  }

  // Protect /author/dashboard routes
  if (pathname.startsWith("/author/dashboard")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/author/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // Check if user is in authorized_authors allowlist
    const { data: authorized } = await supabase
      .from("authorized_authors")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!authorized) {
      // User is authenticated in Supabase, but NOT the authorized author!
      const url = request.nextUrl.clone();
      url.pathname = "/author/login";
      url.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(url);
    }
  }

  // Redirect away from login if already authenticated & authorized
  if (pathname === "/author/login" && user) {
    const { data: authorized } = await supabase
      .from("authorized_authors")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (authorized) {
      const url = request.nextUrl.clone();
      url.pathname = "/author/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

