import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { obtenerEstadisticasTikTok } from "@/lib/tiktok";

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

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 });
  }

  const stats = await obtenerEstadisticasTikTok();
  if (!stats) {
    return NextResponse.json({ error: "No se pudieron obtener las estadísticas de TikTok" }, { status: 502 });
  }

  const { error } = await supabaseAdmin.from("redes_metricas").insert({
    plataforma: "tiktok",
    seguidores: stats.seguidores,
    publicaciones: stats.videos,
    metrica_extra: { siguiendo: stats.siguiendo, likes: stats.likes },
  });

  if (error) {
    console.error("No se pudo guardar la métrica de TikTok:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, ...stats });
}
