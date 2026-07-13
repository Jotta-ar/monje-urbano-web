import "server-only";
import { supabaseAdmin } from "@/lib/supabase-admin";

const REDIRECT_URI = "https://monjeurbanolibre.com/api/auth/tiktok/callback";
const SCOPE = "user.info.basic,user.info.stats";

/**
 * TIKTOK_ENV="sandbox" (default) mientras la app de producción espera la
 * revisión de TikTok (necesita un video demo de la integración funcionando,
 * que recién podemos grabar una vez que esto ande). Cambiar a "production"
 * cuando TikTok apruebe la app real — no requiere tocar ningún otro código.
 */
function credenciales(): { clientKey: string; clientSecret: string } | null {
  const esProduccion = process.env.TIKTOK_ENV === "production";
  const clientKey = esProduccion ? process.env.TIKTOK_CLIENT_KEY : process.env.TIKTOK_SANDBOX_CLIENT_KEY;
  const clientSecret = esProduccion
    ? process.env.TIKTOK_CLIENT_SECRET
    : process.env.TIKTOK_SANDBOX_CLIENT_SECRET;
  if (!clientKey || !clientSecret) return null;
  return { clientKey, clientSecret };
}

export function construirUrlAutorizacion(state: string): string | null {
  const creds = credenciales();
  if (!creds) return null;
  const url = new URL("https://www.tiktok.com/v2/auth/authorize/");
  url.searchParams.set("client_key", creds.clientKey);
  url.searchParams.set("scope", SCOPE);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", REDIRECT_URI);
  url.searchParams.set("state", state);
  return url.toString();
}

interface RespuestaToken {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_expires_in: number;
  open_id: string;
  error?: string;
  error_description?: string;
}

async function guardarToken(datos: RespuestaToken) {
  if (!supabaseAdmin) return;
  const ahora = Date.now();
  await supabaseAdmin.from("oauth_tokens").upsert(
    {
      plataforma: "tiktok",
      access_token: datos.access_token,
      refresh_token: datos.refresh_token,
      expires_at: new Date(ahora + datos.expires_in * 1000).toISOString(),
      refresh_expires_at: new Date(ahora + datos.refresh_expires_in * 1000).toISOString(),
      open_id: datos.open_id,
      actualizado_en: new Date(ahora).toISOString(),
    },
    { onConflict: "plataforma" }
  );
}

export async function intercambiarCodigoPorToken(code: string): Promise<boolean> {
  const creds = credenciales();
  if (!creds) return false;

  const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Cache-Control": "no-cache" },
    body: new URLSearchParams({
      client_key: creds.clientKey,
      client_secret: creds.clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI,
    }),
  });

  const datos = (await res.json().catch(() => null)) as RespuestaToken | null;
  if (!res.ok || !datos?.access_token) {
    console.error("TikTok: no se pudo intercambiar el code por un token:", res.status, datos);
    return false;
  }

  await guardarToken(datos);
  return true;
}

/**
 * Devuelve un access_token vigente, refrescando primero si está por vencer.
 * TikTok v2 ROTA el refresh_token en cada uso (el anterior queda inválido) —
 * hay que guardar ambos juntos, nunca solo el access_token nuevo, o el
 * próximo refresh va a fallar.
 */
async function obtenerAccessTokenValido(): Promise<string | null> {
  if (!supabaseAdmin) return null;

  const { data: fila } = await supabaseAdmin
    .from("oauth_tokens")
    .select("access_token, refresh_token, expires_at")
    .eq("plataforma", "tiktok")
    .maybeSingle();

  if (!fila) return null;

  const vencePronto = !fila.expires_at || new Date(fila.expires_at).getTime() - Date.now() < 5 * 60 * 1000;
  if (!vencePronto) return fila.access_token;

  const creds = credenciales();
  if (!creds || !fila.refresh_token) return null;

  const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Cache-Control": "no-cache" },
    body: new URLSearchParams({
      client_key: creds.clientKey,
      client_secret: creds.clientSecret,
      grant_type: "refresh_token",
      refresh_token: fila.refresh_token,
    }),
  });

  const datos = (await res.json().catch(() => null)) as RespuestaToken | null;
  if (!res.ok || !datos?.access_token) {
    console.error("TikTok: no se pudo refrescar el token:", res.status, datos);
    return null;
  }

  await guardarToken(datos);
  return datos.access_token;
}

export interface EstadisticasTikTok {
  seguidores: number;
  siguiendo: number;
  likes: number;
  videos: number;
}

export async function obtenerEstadisticasTikTok(): Promise<EstadisticasTikTok | null> {
  const accessToken = await obtenerAccessTokenValido();
  if (!accessToken) {
    console.error("TikTok: todavía no hay una cuenta conectada (sin token en oauth_tokens).");
    return null;
  }

  const res = await fetch(
    "https://open.tiktokapis.com/v2/user/info/?fields=follower_count,following_count,likes_count,video_count",
    { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" }
  );

  const json = await res.json().catch(() => null);
  const stats = json?.data?.user;
  if (!res.ok || !stats) {
    console.error("TikTok: no se pudieron leer las estadísticas:", res.status, json);
    return null;
  }

  return {
    seguidores: Number(stats.follower_count ?? 0),
    siguiendo: Number(stats.following_count ?? 0),
    likes: Number(stats.likes_count ?? 0),
    videos: Number(stats.video_count ?? 0),
  };
}
