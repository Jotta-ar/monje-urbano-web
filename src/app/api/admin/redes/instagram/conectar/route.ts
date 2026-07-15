import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { construirUrlAutorizacion } from "@/lib/instagram";

/**
 * Se llama desde un <a href> normal (no fetch) — mismo patrón que
 * /api/admin/redes/tiktok/conectar, ver ese archivo para el porqué del
 * ?token= como fallback en requireAdmin.
 */
export async function GET(req: NextRequest) {
  const userId = await requireAdmin(req);
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const state = crypto.randomUUID();
  const urlAutorizacion = construirUrlAutorizacion(state);
  if (!urlAutorizacion) {
    return NextResponse.json({ error: "Instagram no está configurado (faltan credenciales)" }, { status: 500 });
  }

  const res = NextResponse.redirect(urlAutorizacion);
  res.cookies.set("instagram_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 300,
    path: "/",
  });
  return res;
}
