import "server-only";

const PROXY_URL = process.env.MP_PROXY_URL?.trim();
const PROXY_SECRET = process.env.MP_PROXY_SECRET?.trim();

export const MP_CONFIGURED = !!(PROXY_URL && PROXY_SECRET);

/**
 * Llama a la API de Mercado Pago a través de una Edge Function de Supabase
 * (supabase/functions/mp-proxy) en vez de directo desde acá: confirmado con
 * pruebas manuales que Mercado Pago devuelve un 403 sin body a cualquier
 * request que salga desde la infraestructura de Vercel (probamos función
 * Node y función Edge, mismo resultado), mientras que el mismo request
 * exacto funciona perfecto llamado desde afuera de Vercel — es un bloqueo
 * de reputación de IP del lado de Mercado Pago, no un problema de nuestro
 * código. La función de Supabase corre en otra red (Deno Deploy) y hace la
 * llamada real, autenticada con el access token que vive ahí como secret.
 */
export async function mpFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<{ ok: boolean; status: number; data: T | null; raw: string }> {
  if (!PROXY_URL || !PROXY_SECRET) {
    throw new Error("MP_PROXY_URL / MP_PROXY_SECRET no configurados");
  }
  const res = await fetch(PROXY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // El gateway de Supabase exige un Authorization con un JWT/anon key
      // válido antes de dejar pasar la request a la función, sin importar
      // el "x-proxy-secret" propio de acá abajo. La anon key ya es pública
      // (se manda al navegador en el resto del sitio), no es un secreto.
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      "x-proxy-secret": PROXY_SECRET,
    },
    body: JSON.stringify({
      path,
      method: init.method ?? "GET",
      bodyRaw: typeof init.body === "string" ? init.body : undefined,
    }),
  });
  const raw = await res.text();
  let data: T | null = null;
  if (raw) {
    try {
      data = JSON.parse(raw) as T;
    } catch {
      data = null;
    }
  }
  return { ok: res.ok, status: res.status, data, raw };
}

/**
 * Maps a servicio + modalidad (as chosen in the order form) to the matching
 * row id in the `precios` table. Looked up server-side so the actual amount
 * charged always comes from our own database, never from anything the
 * browser sends — a tampered client request can't change the price.
 *
 * Returns null for combinations without a fixed, auto-charge price (e.g.
 * "intensivo" in Magia Sanadora needs a custom quote via Consultas).
 */
export function precioIdPara(servicio: string, modalidad?: string | null): string | null {
  switch (servicio) {
    case "manifiesto":
      return "manifiesto";
    case "ritual_matutino":
      return "ritual_matutino";
    case "cartografia":
      return "cartografia_pdf";
    case "magia_sanadora":
      switch (modalidad) {
        case "unica":
          return "magia_unica";
        case "serie3":
          return "magia_serie3";
        case "serie6":
          return "magia_serie6";
        case "serie9":
          return "magia_serie9";
        default:
          return null;
      }
    default:
      return null;
  }
}

export const SERVICIO_TITULOS: Record<string, string> = {
  manifiesto: "Manifiesto Personalizado",
  ritual_matutino: "Ritual Matutino Personalizado",
  cartografia: "Cartografía del Síntoma",
  magia_sanadora: "Magia Sanadora",
};
