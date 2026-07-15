import "server-only";
import { supabaseAdmin } from "@/lib/supabase-admin";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

export interface EstadisticasYoutube {
  seguidores: number;
  publicaciones: number;
  vistasTotales: number;
}

/**
 * Trae las estadísticas públicas del canal (suscriptores, videos, vistas)
 * con la API pública de YouTube Data v3 — no requiere OAuth ni que Jose
 * cambie nada de la cuenta, solo una API key gratuita de Google Cloud
 * Console. Devuelve null si falta configuración o si falla la consulta;
 * quien llama decide qué hacer (no tiene sentido tirar una excepción por
 * una métrica que puede esperar a la próxima corrida del cron).
 */
export async function obtenerEstadisticasYoutube(): Promise<EstadisticasYoutube | null> {
  if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) {
    console.error("YOUTUBE_API_KEY o YOUTUBE_CHANNEL_ID no configuradas.");
    return null;
  }

  const url = new URL("https://www.googleapis.com/youtube/v3/channels");
  url.searchParams.set("part", "statistics");
  url.searchParams.set("id", YOUTUBE_CHANNEL_ID);
  url.searchParams.set("key", YOUTUBE_API_KEY);

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      console.error("YouTube Data API devolvió un error:", res.status, await res.text());
      return null;
    }
    const json = await res.json();
    const stats = json?.items?.[0]?.statistics;
    if (!stats) {
      console.error("YouTube Data API no devolvió estadísticas para el canal configurado.");
      return null;
    }
    return {
      seguidores: Number(stats.subscriberCount ?? 0),
      publicaciones: Number(stats.videoCount ?? 0),
      vistasTotales: Number(stats.viewCount ?? 0),
    };
  } catch (err) {
    console.error("Falló la llamada a YouTube Data API:", err);
    return null;
  }
}

export async function registrarSnapshotYoutube(): Promise<EstadisticasYoutube | null> {
  if (!supabaseAdmin) return null;

  const stats = await obtenerEstadisticasYoutube();
  if (!stats) return null;

  const { error } = await supabaseAdmin.from("redes_metricas").insert({
    plataforma: "youtube",
    seguidores: stats.seguidores,
    publicaciones: stats.publicaciones,
    metrica_extra: { vistas_totales: stats.vistasTotales },
  });

  if (error) {
    console.error("No se pudo guardar la métrica de YouTube:", error);
    return null;
  }

  return stats;
}
