import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Null until real Supabase credentials are set in .env.local (see .env.local.example).
 * Every call site must handle the null case — the site must keep working (forms just
 * won't persist) while the client's Supabase project isn't wired up yet.
 */
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;
