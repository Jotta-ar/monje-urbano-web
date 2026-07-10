import "server-only";

const CLIENT_ID = process.env.PAYPAL_CLIENT_ID?.trim();
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET?.trim();
const MODE = process.env.PAYPAL_MODE === "live" ? "live" : "sandbox";
const BASE_URL = MODE === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

export const PAYPAL_CONFIGURED = !!(CLIENT_ID && CLIENT_SECRET);

async function obtenerToken(): Promise<string> {
  const res = await fetch(`${BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.access_token) {
    throw new Error("No se pudo obtener el token de acceso de PayPal");
  }
  return data.access_token as string;
}

/**
 * Llama a la API REST de PayPal (Orders v2). A diferencia de Mercado Pago,
 * PayPal no bloquea las IPs de Vercel (confirmar en la primera prueba real),
 * así que esto pega directo a la API en vez de necesitar el proxy de
 * Supabase que usa mercadopago.ts.
 */
export async function paypalFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<{ ok: boolean; status: number; data: T | null; raw: string }> {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET no configurados");
  }
  const token = await obtenerToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
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
