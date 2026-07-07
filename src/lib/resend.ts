import "server-only";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.NOTIFY_EMAIL || "pedidos@monjeurbanolibre.com";

/**
 * Manda un mail transaccional con Resend. Nunca tira excepción — si falla,
 * queda logueado pero no debe cortar el flujo que lo llama (por ejemplo, el
 * webhook de Mercado Pago tiene que poder marcar un pedido como pagado
 * aunque el mail de aviso no salga).
 */
export async function enviarEmail(params: { to: string; subject: string; html: string }): Promise<void> {
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY no configurada, no se pudo enviar el mail:", params.subject);
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Monje Urbano Libre <${FROM_EMAIL}>`,
        to: [params.to],
        subject: params.subject,
        html: params.html,
      }),
    });
    if (!res.ok) {
      console.error("Resend devolvió un error enviando el mail:", res.status, await res.text());
    }
  } catch (err) {
    console.error("Falló la llamada a Resend:", err);
  }
}
