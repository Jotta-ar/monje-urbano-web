import { NextRequest, NextResponse } from "next/server";
import { PAYPAL_CONFIGURED, paypalFetch } from "@/lib/paypal";
import { precioIdPara } from "@/lib/mercadopago";
import { supabaseAdmin } from "@/lib/supabase-admin";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/**
 * Crea una orden de PayPal (Orders v2, intent CAPTURE) y devuelve el link de
 * aprobación. El monto SIEMPRE se busca en `precios.monto_usd` del lado del
 * servidor, igual que crear-preferencia.ts hace con Mercado Pago — nunca se
 * confía en un monto que mande el navegador.
 */
export async function POST(req: NextRequest) {
  if (!PAYPAL_CONFIGURED || !supabaseAdmin) {
    return NextResponse.json({ error: "PayPal no está configurado" }, { status: 500 });
  }

  const body = await req.json().catch(() => ({}));
  const compraId = typeof body.compraId === "string" ? body.compraId : null;
  if (!compraId) {
    return NextResponse.json({ error: "Falta compraId" }, { status: 400 });
  }

  const { data: compra, error } = await supabaseAdmin
    .from("compras")
    .select("id, servicio, modalidad, moneda, estado")
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
      { error: "PayPal solo está habilitado para pagos en dólares" },
      { status: 400 }
    );
  }

  const precioId = precioIdPara(compra.servicio, compra.modalidad);
  if (!precioId) {
    return NextResponse.json(
      { error: "Esta modalidad requiere un presupuesto a medida, escribinos por consultas" },
      { status: 400 }
    );
  }

  const { data: precio, error: precioError } = await supabaseAdmin
    .from("precios")
    .select("monto_usd, label")
    .eq("id", precioId)
    .single();

  if (precioError || !precio || precio.monto_usd == null) {
    return NextResponse.json(
      { error: "El precio de este servicio todavía no está configurado" },
      { status: 400 }
    );
  }

  const amount = Number(precio.monto_usd);

  await supabaseAdmin
    .from("compras")
    .update({ monto: amount, pasarela: "paypal" })
    .eq("id", compraId);

  let resultado;
  try {
    resultado = await paypalFetch<{ id: string; links: { rel: string; href: string }[] }>(
      "/v2/checkout/orders",
      {
        method: "POST",
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              custom_id: compraId,
              description: precio.label,
              amount: { currency_code: "USD", value: amount.toFixed(2) },
            },
          ],
          application_context: {
            brand_name: "Monje Urbano Libre",
            user_action: "PAY_NOW",
            return_url: `${SITE_URL}/api/paypal/capturar?compraId=${compraId}&servicio=${compra.servicio}`,
            cancel_url: `${SITE_URL}/pedir/error`,
          },
        }),
      }
    );
  } catch (err) {
    console.error("Llamada a PayPal (crear orden) falló:", err);
    return NextResponse.json({ error: "No se pudo contactar a PayPal" }, { status: 502 });
  }

  if (!resultado.ok || !resultado.data?.links) {
    console.error(
      `PayPal devolvió un error creando la orden (status ${resultado.status}):`,
      resultado.raw
    );
    return NextResponse.json({ error: "PayPal rechazó la orden de pago" }, { status: 502 });
  }

  const approveLink = resultado.data.links.find((l) => l.rel === "approve")?.href;
  if (!approveLink) {
    return NextResponse.json({ error: "PayPal no devolvió un link de aprobación" }, { status: 502 });
  }

  return NextResponse.json({ initPoint: approveLink });
}
