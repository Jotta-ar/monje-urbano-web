// Reenvía llamadas a la API de Mercado Pago desde la red de Supabase (Deno
// Deploy) en vez de la de Vercel. Confirmado con pruebas manuales: el mismo
// request exacto funciona perfecto llamando a Mercado Pago desde afuera de
// Vercel, pero Vercel (tanto funciones Node como Edge) recibe un 403 sin
// body — un bloqueo de reputación de IP del lado de Mercado Pago contra la
// infraestructura compartida de Vercel, no un problema de nuestro código.
//
// Requiere un secret compartido (header x-proxy-secret) para que esto no
// quede como un proxy abierto hacia Mercado Pago usando nuestro access
// token. Configurar como Secrets de este proyecto en Supabase:
//   MERCADOPAGO_ACCESS_TOKEN  (el mismo access token de siempre)
//   MP_PROXY_SECRET           (un secreto random, compartido con Vercel)

Deno.serve(async (req: Request) => {
  const secret = req.headers.get("x-proxy-secret");
  if (!secret || secret !== Deno.env.get("MP_PROXY_SECRET")) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let path: unknown, method: unknown, bodyRaw: unknown;
  try {
    ({ path, method, bodyRaw } = await req.json());
  } catch {
    return new Response(JSON.stringify({ error: "JSON inválido" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (typeof path !== "string" || !path.startsWith("/")) {
    return new Response(JSON.stringify({ error: "path inválido" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const token = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
  const mpRes = await fetch(`https://api.mercadopago.com${path}`, {
    method: typeof method === "string" ? method : "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: typeof bodyRaw === "string" ? bodyRaw : undefined,
  });

  const raw = await mpRes.text();
  return new Response(raw, {
    status: mpRes.status,
    headers: { "Content-Type": "application/json" },
  });
});
