import { NextRequest, NextResponse } from "next/server";
import { PAYPAL_CONFIGURED, paypalFetch } from "@/lib/paypal";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { confirmarPago } from "@/lib/confirmarPago";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/**
 * PayPal redirige acá (GET, vía el navegador del cliente) después de que
 * aprueba el pago en su sitio — a diferencia de Mercado Pago, el pago recién
 * se efectiviza cuando LLAMAMOS a este capture, no antes. Por eso esta ruta
 * hace la captura server-side y solo después llama a confirmarPago.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token"); // id de la orden de PayPal
  const compraId = req.nextUrl.searchParams.get("compraId");
  const servicio = req.nextUrl.searchParams.get("servicio");

  if (!PAYPAL_CONFIGURED || !supabaseAdmin || !token || !compraId) {
    return NextResponse.redirect(`${SITE_URL}/pedir/error`);
  }

  try {
    const resultado = await paypalFetch<{ status?: string }>(
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
  } catch (err) {
    console.error("Llamada a PayPal (capturar) falló:", err);
    return NextResponse.redirect(`${SITE_URL}/pedir/error`);
  }

  await confirmarPago(compraId);

  return NextResponse.redirect(
    `${SITE_URL}/pedir/gracias${servicio ? `?servicio=${servicio}` : ""}`
  );
}
