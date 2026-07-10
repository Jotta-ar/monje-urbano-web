import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { precioIdPara } from "@/lib/mercadopago";
import { enviarEmail } from "@/lib/resend";
import { emailAvisoTransferenciaPendiente } from "@/lib/emailTemplates";

const ADMIN_EMAIL = process.env.NOTIFY_EMAIL || "pedidos@monjeurbanolibre.com";

/**
 * Registra que un pedido en USD eligió un método de pago manual —
 * transferencia bancaria o USDT (misma mecánica, distinto dato a mostrar) —
 * no confirma el pago (eso lo hace el admin a mano desde /admin cuando ve
 * que el dinero entró, ver /api/admin/pedidos/[id]/confirmar-transferencia).
 * El monto se busca en `precios.monto_usd` del lado del servidor, igual que
 * el resto de las pasarelas. Si el cliente ya subió el comprobante en el
 * mismo momento, su ruta en Storage viaja en `comprobanteUrl`.
 */
export async function POST(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Backend no configurado" }, { status: 500 });
  }

  const body = await req.json().catch(() => ({}));
  const compraId = typeof body.compraId === "string" ? body.compraId : null;
  const comprobanteUrl = typeof body.comprobanteUrl === "string" ? body.comprobanteUrl : null;
  const metodo = body.metodo === "usdt" ? "usdt" : "banco";
  if (!compraId) {
    return NextResponse.json({ error: "Falta compraId" }, { status: 400 });
  }

  const { data: compra, error } = await supabaseAdmin
    .from("compras")
    .select(
      "id, numero, servicio, modalidad, moneda, estado, token, comprador_nombre, comprador_apellido, comprador_email"
    )
    .eq("id", compraId)
    .single();

  if (error || !compra) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }
  if (compra.estado !== "pendiente_pago") {
    return NextResponse.json({ error: "Este pedido ya fue procesado" }, { status: 400 });
  }
  if (compra.moneda !== "USD") {
    return NextResponse.json(
      { error: "La transferencia solo aplica a pagos en dólares" },
      { status: 400 }
    );
  }

  const precioId = precioIdPara(compra.servicio, compra.modalidad);
  const { data: precio } = precioId
    ? await supabaseAdmin.from("precios").select("monto_usd, label").eq("id", precioId).single()
    : { data: null };
  const amount = precio?.monto_usd != null ? Number(precio.monto_usd) : null;

  const { error: updateError } = await supabaseAdmin
    .from("compras")
    .update({
      pasarela: metodo === "usdt" ? "usdt" : "transferencia",
      monto: amount,
      ...(comprobanteUrl ? { comprobante_transferencia_url: comprobanteUrl } : {}),
    })
    .eq("id", compraId);
  if (updateError) {
    console.error("transferencia: no se pudo marcar pasarela en la compra:", updateError);
  }

  const configColumna = metodo === "usdt" ? "wallet_usdt_trc20" : "datos_transferencia_usd";
  const { data: config, error: configError } = await supabaseAdmin
    .from("configuracion")
    .select(configColumna)
    .eq("id", 1)
    .maybeSingle<Record<string, string | null>>();
  if (configError) {
    console.error("transferencia: no se pudo leer configuracion (¿corriste migration_008/009?):", configError);
  }

  await enviarEmail({
    to: ADMIN_EMAIL,
    ...emailAvisoTransferenciaPendiente({
      numero: compra.numero,
      servicio: compra.servicio,
      monto: amount,
      compradorNombre: compra.comprador_nombre,
      compradorApellido: compra.comprador_apellido,
      compradorEmail: compra.comprador_email,
      tieneComprobante: !!comprobanteUrl,
      metodo,
    }),
  });

  return NextResponse.json({
    token: compra.token,
    metodo,
    datosTransferencia: config?.[configColumna] ?? null,
    amount,
    title: precio?.label ?? null,
  });
}
