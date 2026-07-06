import "server-only";

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();

export const MP_ACCESS_TOKEN = accessToken || null;

/**
 * Llama directamente a la API REST de Mercado Pago con fetch, en vez de usar
 * el SDK oficial: el SDK a veces intenta parsear como JSON una respuesta
 * vacía (típico en errores 4xx) y explota con "Unexpected end of JSON
 * input" en vez de mostrar el error real. Acá leemos el body como texto
 * primero, así siempre podemos loguear o devolver el motivo verdadero.
 */
export async function mpFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<{ ok: boolean; status: number; data: T | null; raw: string }> {
  const res = await fetch(`https://api.mercadopago.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      // fetch en Node no manda User-Agent por defecto; sin uno, el firewall
      // de Mercado Pago rechaza la request con un 403 vacío (sin body).
      "User-Agent": "MonjeUrbanoLibre/1.0",
      Accept: "application/json",
      ...init.headers,
    },
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
