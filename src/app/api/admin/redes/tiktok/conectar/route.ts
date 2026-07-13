import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { construirUrlAutorizacion } from "@/lib/tiktok";

/**
 * Se llama desde un <a href> normal (no fetch), porque el paso siguiente es
 * un redirect de navegador a TikTok — por eso requireAdmin acepta ?token=
 * acá en vez de depender del header Authorization.
 */
export async function GET(req: NextRequest) {
  const userId = await requireAdmin(req);
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const state = crypto.randomUUID();
  const urlAutorizacion = construirUrlAutorizacion(state);
  if (!urlAutorizacion) {
    return NextResponse.json({ error: "TikTok no está configurado (faltan credenciales)" }, { status: 500 });
  }

  const res = NextResponse.redirect(urlAutorizacion);
  res.cookies.set("tiktok_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 300,
    path: "/",
  });
  return res;
}
