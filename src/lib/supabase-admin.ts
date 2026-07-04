import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Server-only client using the service_role key — bypasses RLS entirely.
 * Never import this from a "use client" component or expose it to the
 * browser. Used for: the admin dashboard (listing all orders) and the
 * gift-link routes (validating a token server-side instead of trusting a
 * public RLS policy to do it).
 */
export const supabaseAdmin: SupabaseClient | null =
  url && serviceKey ? createClient(url, serviceKey) : null;
