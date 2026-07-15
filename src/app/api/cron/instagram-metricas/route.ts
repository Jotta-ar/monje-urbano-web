import { NextRequest, NextResponse } from "next/server";
import { registrarSnapshotInstagram } from "@/lib/instagram";

/**
 * Mismo patrón que /api/cron/tiktok-metricas y /api/cron/youtube-metricas.
 */
export async function GET(req: NextRequest) {
  const secretoEsperado = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!secretoEsperado || token !== secretoEsperado) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const stats = await registrarSnapshotInstagram();
  if (!stats) {
    return NextResponse.json({ error: "No se pudieron obtener/guardar las estadísticas de Instagram" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, ...stats });
}
