import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";
import { supabaseUrl, supabaseAnonKey, isSupabaseConfigured } from "./env";

let publicSupabaseInstance: SupabaseClient | null = null;

export function getPublicSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    return null;
  }
  if (!publicSupabaseInstance) {
    publicSupabaseInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        fetch: (url, options = {}) =>
          fetch(url, {
            ...options,
            next: {
              revalidate: 60,
              tags: ["publications", "author"],
            },
          }),
      },
    });
  }
  return publicSupabaseInstance;
}
