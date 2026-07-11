import "server-only";
import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * Verifies the Supabase Auth access token sent by an /admin/* page in the
 * Authorization header. Returns the user id if valid, or null otherwise.
 * Every /api/admin/* route must call this before touching the service_role
 * client — it's what stands in for RLS now that those routes bypass it.
 *
 * Un token válido de Supabase Auth solo prueba que la persona está
 * autenticada, no que sea admin. Por eso, además, comparamos el email del
 * usuario contra ADMIN_EMAIL (única cuenta admin hoy). Si ADMIN_EMAIL no
 * está configurado, se deniega todo (fail-closed) en vez de dejar pasar a
 * cualquier usuario autenticado.
 */
export async function requireAdmin(req: NextRequest): Promise<string | null> {
  if (!supabaseAdmin) return null;
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail) {
    console.warn(
      "requireAdmin: ADMIN_EMAIL no está seteado en el entorno — se deniega todo acceso admin."
    );
    return null;
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;

  const userEmail = data.user.email?.trim().toLowerCase();
  if (!userEmail || userEmail !== adminEmail) return null;

  return data.user.id;
}
