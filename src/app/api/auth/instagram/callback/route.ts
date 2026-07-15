import { NextRequest, NextResponse } from "next/server";
import { intercambiarCodigoPorToken, registrarSnapshotInstagram } from "@/lib/instagram";

/**
 * Instagram redirige acá con ?code&state. Mismo patrón de protección que
 * /api/auth/tiktok/callback: sin requireAdmin (Instagram no manda el
 * Bearer), se valida el state contra la cookie que puso la ruta "conectar".
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const stateCookie = req.cookies.get("instagram_oauth_state")?.value;

  const destino = new URL("/admin", req.nextUrl.origin);

  if (!code || !state || !stateCookie || state !== stateCookie) {
    destino.searchParams.set("instagram", "error");
    const res = NextResponse.redirect(destino);
    res.cookies.delete("instagram_oauth_state");
    return res;
  }

  const ok = await intercambiarCodigoPorToken(code);
  if (ok) {
    // Best-effort, igual que con TikTok: si falla, el cron semanal lo completa.
    await registrarSnapshotInstagram();
  }
  destino.searchParams.set("instagram", ok ? "conectado" : "error");

  const res = NextResponse.redirect(destino);
  res.cookies.delete("instagram_oauth_state");
  return res;
}
