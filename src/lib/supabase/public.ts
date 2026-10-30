import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { supabaseUrl, supabaseAnonKey, isSupabaseConfigured } from "./env";

export function getPublicSupabase() {
  if (!isSupabaseConfigured) {
    return null;
  }
  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
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
