import { NextRequest, NextResponse } from "next/server";
import { intercambiarCodigoPorToken } from "@/lib/tiktok";

/**
 * TikTok redirige acá con ?code&state después de que Jose autoriza la app.
 * No puede mandar el header Authorization, así que esta ruta no pasa por
 * requireAdmin — la protección es que el state tiene que coincidir con la
 * cookie que puso /api/admin/redes/tiktok/conectar, probando que es
 * continuación de un flujo que nosotros iniciamos.
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const stateCookie = req.cookies.get("tiktok_oauth_state")?.value;

  const destino = new URL("/admin", req.nextUrl.origin);

  if (!code || !state || !stateCookie || state !== stateCookie) {
    destino.searchParams.set("tiktok", "error");
    const res = NextResponse.redirect(destino);
    res.cookies.delete("tiktok_oauth_state");
    return res;
  }

  const ok = await intercambiarCodigoPorToken(code);
  destino.searchParams.set("tiktok", ok ? "conectado" : "error");

  const res = NextResponse.redirect(destino);
  res.cookies.delete("tiktok_oauth_state");
  return res;
}
