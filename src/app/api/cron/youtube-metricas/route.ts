import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { obtenerEstadisticasYoutube } from "@/lib/youtube";

/**
 * Vercel Cron llama a esta URL una vez por semana (ver vercel.json) mandando
 * el mismo secreto como Bearer token — mismo patrón defensivo que
 * requireAdmin(), pero contra CRON_SECRET en vez de una sesión de usuario.
 * También se puede disparar a mano para probarla (ver README).
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

  const stats = await obtenerEstadisticasYoutube();
  if (!stats) {
    return NextResponse.json({ error: "No se pudieron obtener las estadísticas de YouTube" }, { status: 502 });
  }

  const { error } = await supabaseAdmin.from("redes_metricas").insert({
    plataforma: "youtube",
    seguidores: stats.seguidores,
    publicaciones: stats.publicaciones,
    metrica_extra: { vistas_totales: stats.vistasTotales },
  });

  if (error) {
    console.error("No se pudo guardar la métrica de YouTube:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, ...stats });
}
