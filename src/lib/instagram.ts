import "server-only";
import { supabaseAdmin } from "@/lib/supabase-admin";

const REDIRECT_URI = "https://monjeurbanolibre.com/api/auth/instagram/callback";
const SCOPE =
  "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights";

const APP_ID = process.env.INSTAGRAM_APP_ID;
const APP_SECRET = process.env.INSTAGRAM_APP_SECRET;

export function construirUrlAutorizacion(state: string): string | null {
  if (!APP_ID) return null;
  const url = new URL("https://www.instagram.com/oauth/authorize");
  url.searchParams.set("client_id", APP_ID);
  url.searchParams.set("redirect_uri", REDIRECT_URI);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", SCOPE);
  url.searchParams.set("state", state);
  return url.toString();
}

async function guardarToken(accessToken: string, expiresInSegundos: number) {
  if (!supabaseAdmin) return;
  const ahora = Date.now();
  await supabaseAdmin.from("oauth_tokens").upsert(
    {
      plataforma: "instagram",
      access_token: accessToken,
      expires_at: new Date(ahora + expiresInSegundos * 1000).toISOString(),
      actualizado_en: new Date(ahora).toISOString(),
    },
    { onConflict: "plataforma" }
  );
}

/**
 * El code de Instagram Login se cambia primero por un token de corta
 * duración (1h), y ese a su vez se cambia por uno de larga duración
 * (~60 días, ver graph.instagram.com/access_token). No hay refresh_token
 * separado como en TikTok — el mismo access_token de larga duración se
 * "renueva" llamando a refresh_access_token antes de que venza.
 */
export async function intercambiarCodigoPorToken(code: string): Promise<boolean> {
  if (!APP_ID || !APP_SECRET) return false;

  const resCorto = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: APP_ID,
      client_secret: APP_SECRET,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI,
      code,
    }),
  });
  const datosCorto = await resCorto.json().catch(() => null);
  const tokenCorto = datosCorto?.access_token;
  if (!resCorto.ok || !tokenCorto) {
    console.error("Instagram: no se pudo intercambiar el code por un token corto:", resCorto.status, datosCorto);
    return false;
  }

  const urlLargo = new URL("https://graph.instagram.com/access_token");
  urlLargo.searchParams.set("grant_type", "ig_exchange_token");
  urlLargo.searchParams.set("client_secret", APP_SECRET);
  urlLargo.searchParams.set("access_token", tokenCorto);
  const resLargo = await fetch(urlLargo);
  const datosLargo = await resLargo.json().catch(() => null);
  if (!resLargo.ok || !datosLargo?.access_token) {
    console.error("Instagram: no se pudo cambiar el token corto por uno de larga duración:", resLargo.status, datosLargo);
    return false;
  }

  await guardarToken(datosLargo.access_token, datosLargo.expires_in ?? 60 * 24 * 60 * 60);
  return true;
}

async function obtenerAccessTokenValido(): Promise<string | null> {
  if (!supabaseAdmin) return null;

  const { data: fila } = await supabaseAdmin
    .from("oauth_tokens")
    .select("access_token, expires_at")
    .eq("plataforma", "instagram")
    .maybeSingle();

  if (!fila) return null;

  // Refresca con margen amplio (5 días) porque el token de Instagram dura
  // ~60 días y este cron corre semanal — sin margen, se pasaría de fecha.
  const vencePronto = !fila.expires_at || new Date(fila.expires_at).getTime() - Date.now() < 5 * 24 * 60 * 60 * 1000;
  if (!vencePronto) return fila.access_token;

  const url = new URL("https://graph.instagram.com/refresh_access_token");
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", fila.access_token);
  const res = await fetch(url);
  const datos = await res.json().catch(() => null);
  if (!res.ok || !datos?.access_token) {
    console.error("Instagram: no se pudo refrescar el token:", res.status, datos);
    return fila.access_token; // sigue vigente todavía, mejor usar el viejo que nada
  }

  await guardarToken(datos.access_token, datos.expires_in ?? 60 * 24 * 60 * 60);
  return datos.access_token;
}

export interface EstadisticasInstagram {
  seguidores: number;
  siguiendo: number;
  publicaciones: number;
}

export async function obtenerEstadisticasInstagram(): Promise<EstadisticasInstagram | null> {
  const accessToken = await obtenerAccessTokenValido();
  if (!accessToken) {
    console.error("Instagram: todavía no hay una cuenta conectada (sin token en oauth_tokens).");
    return null;
  }

  const url = new URL("https://graph.instagram.com/v21.0/me");
  url.searchParams.set("fields", "followers_count,follows_count,media_count");
  url.searchParams.set("access_token", accessToken);
  const res = await fetch(url, { cache: "no-store" });
  const datos = await res.json().catch(() => null);
  if (!res.ok || datos?.followers_count === undefined) {
    console.error("Instagram: no se pudieron leer las estadísticas:", res.status, datos);
    return null;
  }

  return {
    seguidores: Number(datos.followers_count ?? 0),
    siguiendo: Number(datos.follows_count ?? 0),
    publicaciones: Number(datos.media_count ?? 0),
  };
}

export async function registrarSnapshotInstagram(): Promise<EstadisticasInstagram | null> {
  if (!supabaseAdmin) return null;

  const stats = await obtenerEstadisticasInstagram();
  if (!stats) return null;

  const { error } = await supabaseAdmin.from("redes_metricas").insert({
    plataforma: "instagram",
    seguidores: stats.seguidores,
    publicaciones: stats.publicaciones,
    metrica_extra: { siguiendo: stats.siguiendo },
  });

  if (error) {
    console.error("No se pudo guardar la métrica de Instagram:", error);
    return null;
  }

  return stats;
}
