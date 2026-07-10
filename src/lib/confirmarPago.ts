import "server-only";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { enviarEmail } from "@/lib/resend";
import { emailAvisoAdmin, emailGraciasComprador, emailLinkRegalo } from "@/lib/emailTemplates";

const ADMIN_EMAIL = process.env.NOTIFY_EMAIL || "pedidos@monjeurbanolibre.com";

/**
 * Punto único donde un pedido pasa de "pendiente_pago" a pagado y se
 * disparan los mails de aviso — lo llaman el webhook de Mercado Pago, la
 * ruta de captura de PayPal, y la confirmación manual de transferencia
 * desde /admin. El filtro .eq("estado", "pendiente_pago") en el update hace
 * esto idempotente: si algo dispara la confirmación dos veces (reintento de
 * webhook, doble click en el panel), el segundo intento no encuentra fila
 * para actualizar y no se reenvían los mails.
 */
export async function confirmarPago(
  compraId: string
): Promise<{ ok: boolean; yaProcesado: boolean }> {
  if (!supabaseAdmin) return { ok: false, yaProcesado: false };

  const { data: compra } = await supabaseAdmin
    .from("compras")
    .select("id, es_regalo")
    .eq("id", compraId)
    .single();

  if (!compra) return { ok: false, yaProcesado: false };

  const ahora = new Date().toISOString();

  const { data: actualizada } = await supabaseAdmin
    .from("compras")
    .update(
      compra.es_regalo
        ? { estado: "pagado_pendiente_formulario", pagado_en: ahora }
        : { estado: "completado", pagado_en: ahora, completado_en: ahora }
    )
    .eq("id", compraId)
    .eq("estado", "pendiente_pago")
    .select(
      "numero, servicio, monto, moneda, es_regalo, token, comprador_nombre, comprador_apellido, comprador_email, destinatario_nombre, destinatario_email"
    )
    .single();

  if (!actualizada) return { ok: true, yaProcesado: true };

  await enviarEmail({ to: ADMIN_EMAIL, ...emailAvisoAdmin(actualizada) });
  if (actualizada.comprador_email) {
    await enviarEmail({ to: actualizada.comprador_email, ...emailGraciasComprador(actualizada) });
  }
  if (actualizada.es_regalo && actualizada.destinatario_email) {
    await enviarEmail({ to: actualizada.destinatario_email, ...emailLinkRegalo(actualizada) });
  }

  return { ok: true, yaProcesado: false };
}
