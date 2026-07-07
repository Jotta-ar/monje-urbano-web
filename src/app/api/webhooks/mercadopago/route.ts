import { NextRequest, NextResponse } from "next/server";
import { MP_CONFIGURED, mpFetch } from "@/lib/mercadopago";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { enviarEmail } from "@/lib/resend";
import { emailAvisoAdmin, emailLinkRegalo } from "@/lib/emailTemplates";

const ADMIN_EMAIL = process.env.NOTIFY_EMAIL || "pedidos@monjeurbanolibre.com";

/**
 * Mercado Pago llama a esta URL cada vez que cambia el estado de un pago.
 * El body de la notificación en sí NO se usa para decidir nada (se puede
 * falsificar) — solo nos dice "revisá el pago X". Con ese id, le volvemos a
 * preguntar a la API de Mercado Pago (a través de mp-proxy en Supabase, ver
 * src/lib/mercadopago.ts) cuál es el estado real, y recién ahí actualizamos
 * la base.
 */
export async function POST(req: NextRequest) {
  if (!MP_CONFIGURED || !supabaseAdmin) {
    return NextResponse.json({ error: "No configurado" }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  const paymentId = body?.data?.id ?? body?.data?.[".id"] ?? null;
  const tipo = body?.type ?? body?.topic;

  if (tipo !== "payment" || !paymentId) {
    // Otras notificaciones (merchant_order, etc.) no nos interesan.
    return NextResponse.json({ ok: true });
  }

  let pago;
  try {
    const resultado = await mpFetch<{ status?: string; external_reference?: string }>(
      `/v1/payments/${paymentId}`
    );
    if (!resultado.ok || !resultado.data) {
      console.error(
        `Mercado Pago devolvió un error consultando el pago ${paymentId} (status ${resultado.status}):`,
        resultado.raw
      );
      return NextResponse.json({ error: "No se pudo verificar el pago" }, { status: 502 });
    }
    pago = resultado.data;
  } catch (err) {
    console.error("No se pudo obtener el pago desde Mercado Pago:", err);
    return NextResponse.json({ error: "No se pudo verificar el pago" }, { status: 502 });
  }

  const externalReference = pago.external_reference;
  if (!externalReference) {
    return NextResponse.json({ ok: true });
  }

  if (pago.status !== "approved") {
    // pending / rejected / cancelled: no tocamos el pedido, el cliente
    // puede reintentar el pago desde la misma página.
    return NextResponse.json({ ok: true });
  }

  const { data: compra } = await supabaseAdmin
    .from("compras")
    .select("id, es_regalo")
    .eq("id", externalReference)
    .single();

  if (!compra) {
    // external_reference del botón de prueba del admin, u otro pago que no
    // corresponde a ningún pedido nuestro: no hay nada que actualizar.
    return NextResponse.json({ ok: true });
  }

  const ahora = new Date().toISOString();

  // El filtro .eq("estado", "pendiente_pago") hace esto idempotente: si
  // Mercado Pago reenvía la misma notificación (pasa seguido, manda varias
  // por el mismo pago), el segundo update no encuentra filas para tocar y
  // .select() devuelve vacío — así los mails de abajo solo salen una vez.
  const { data: actualizada } = await supabaseAdmin
    .from("compras")
    .update(
      compra.es_regalo
        ? { estado: "pagado_pendiente_formulario", pagado_en: ahora }
        : { estado: "completado", pagado_en: ahora, completado_en: ahora }
    )
    .eq("id", externalReference)
    .eq("estado", "pendiente_pago")
    .select(
      "numero, servicio, monto, moneda, es_regalo, token, comprador_nombre, comprador_apellido, comprador_email, destinatario_nombre, destinatario_email"
    )
    .single();

  if (actualizada) {
    await enviarEmail({ to: ADMIN_EMAIL, ...emailAvisoAdmin(actualizada) });
    if (actualizada.es_regalo && actualizada.destinatario_email) {
      await enviarEmail({ to: actualizada.destinatario_email, ...emailLinkRegalo(actualizada) });
    }
  }

  return NextResponse.json({ ok: true });
}

// Mercado Pago a veces valida la URL con un GET simple antes de guardarla.
export async function GET() {
  return NextResponse.json({ ok: true });
}
