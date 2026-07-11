import { NextRequest, NextResponse } from "next/server";
import { PAYPAL_CONFIGURED, paypalFetch } from "@/lib/paypal";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { confirmarPago } from "@/lib/confirmarPago";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/** Forma relevante de la respuesta de POST /v2/checkout/orders/{id}/capture. */
interface CapturaOrden {
  status?: string;
  purchase_units?: {
    payments?: {
      captures?: {
        custom_id?: string;
        amount?: { value?: string; currency_code?: string };
      }[];
    };
  }[];
}

/**
 * PayPal redirige acá (GET, vía el navegador del cliente) después de que
 * aprueba el pago en su sitio — a diferencia de Mercado Pago, el pago recién
 * se efectiviza cuando LLAMAMOS a este capture, no antes. Por eso esta ruta
 * hace la captura server-side y solo después llama a confirmarPago.
 *
 * El `compraId` de acá viene del query string de la URL de retorno, que es
 * controlable por el navegador del comprador — NO es confiable por sí solo.
 * Por eso, antes de confirmar el pago, lo atamos al `custom_id` que
 * seteamos al crear la orden (crear-orden/route.ts) y que PayPal nos
 * devuelve de vuelta en la captura. Si no coinciden, no confirmamos nada.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token"); // id de la orden de PayPal
  const compraId = req.nextUrl.searchParams.get("compraId");
  const servicio = req.nextUrl.searchParams.get("servicio");

  if (!PAYPAL_CONFIGURED || !supabaseAdmin || !token || !compraId) {
    return NextResponse.redirect(`${SITE_URL}/pedir/error`);
  }

  let captura: { custom_id?: string; amount?: { value?: string; currency_code?: string } } | undefined;
  try {
    const resultado = await paypalFetch<CapturaOrden>(
      `/v2/checkout/orders/${token}/capture`,
      { method: "POST" }
    );
    if (!resultado.ok || resultado.data?.status !== "COMPLETED") {
      console.error(
        `PayPal devolvió un error capturando la orden ${token} (status ${resultado.status}):`,
        resultado.raw
      );
      return NextResponse.redirect(`${SITE_URL}/pedir/error`);
    }
    captura = resultado.data?.purchase_units?.[0]?.payments?.captures?.[0];
  } catch (err) {
    console.error("Llamada a PayPal (capturar) falló:", err);
    return NextResponse.redirect(`${SITE_URL}/pedir/error`);
  }

  if (!captura?.custom_id || captura.custom_id !== compraId) {
    console.error(
      `Posible intento de fraude en PayPal: compraId de la URL de retorno ("${compraId}") no coincide con el custom_id capturado por PayPal ("${captura?.custom_id}") para la orden ${token}. No se confirma el pago.`
    );
    return NextResponse.redirect(`${SITE_URL}/pedir/error`);
  }

  const { data: compra } = await supabaseAdmin
    .from("compras")
    .select("monto")
    .eq("id", compraId)
    .single();

  if (
    compra?.monto != null &&
    captura.amount?.value != null &&
    Number(captura.amount.value) !== Number(compra.monto)
  ) {
    console.error(
      `Posible intento de fraude en PayPal: monto capturado (${captura.amount.value}) no coincide con el monto del pedido ${compraId} (${compra.monto}). No se confirma el pago.`
    );
    return NextResponse.redirect(`${SITE_URL}/pedir/error`);
  }

  await confirmarPago(compraId);

  return NextResponse.redirect(
    `${SITE_URL}/pedir/gracias${servicio ? `?servicio=${servicio}` : ""}`
  );
}
