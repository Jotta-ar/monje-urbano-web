import { NextRequest, NextResponse } from "next/server";
import { registrarSnapshotTikTok } from "@/lib/tiktok";

/**
 * Mismo patrón que /api/cron/youtube-metricas: Vercel Cron manda el
 * CRON_SECRET como Bearer automáticamente (ver vercel.json). También se
 * puede disparar a mano para probarla.
 */
export async function GET(req: NextRequest) {
  const secretoEsperado = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!secretoEsperado || token !== secretoEsperado) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const stats = await registrarSnapshotTikTok();
  if (!stats) {
    return NextResponse.json({ error: "No se pudieron obtener/guardar las estadísticas de TikTok" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, ...stats });
}
