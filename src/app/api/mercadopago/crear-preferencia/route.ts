import { NextRequest, NextResponse } from "next/server";
import { Preference } from "mercadopago";
import { mpClient, precioIdPara } from "@/lib/mercadopago";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-auth";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/**
 * Crea una preferencia de pago de Mercado Pago y devuelve la URL de checkout.
 *
 * Dos modos:
 * - Con `compraId`: pedido real de un cliente. El monto a cobrar SIEMPRE se
 *   busca en la tabla `precios` del lado del servidor — nunca se confía en un
 *   monto que mande el navegador, así no se puede pagar de menos manipulando
 *   la request.
 * - Sin `compraId`: botón de prueba del panel de admin ($1 ARS), para
 *   confirmar que la integración funciona antes de habilitarla en los
 *   servicios reales. Requiere sesión de admin.
 */
export async function POST(req: NextRequest) {
  if (!mpClient || !supabaseAdmin) {
    return NextResponse.json({ error: "Mercado Pago no está configurado" }, { status: 500 });
  }

  const body = await req.json().catch(() => ({}));
  const compraId = typeof body.compraId === "string" ? body.compraId : null;

  let title: string;
  let amount: number;
  let externalReference: string;

  if (compraId) {
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
    if (compra.moneda !== "ARS") {
      return NextResponse.json(
        { error: "Mercado Pago solo está habilitado para pagos en pesos" },
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
      .select("monto_ars, label")
      .eq("id", precioId)
      .single();

    if (precioError || !precio || precio.monto_ars == null) {
      return NextResponse.json(
        { error: "El precio de este servicio todavía no está configurado" },
        { status: 400 }
      );
    }

    amount = Number(precio.monto_ars);
    title = precio.label;
    externalReference = compra.id;

    // Guardamos ya el monto autoritativo y la pasarela, para que el panel de
    // admin muestre el precio real aunque el pago todavía no esté confirmado.
    await supabaseAdmin
      .from("compras")
      .update({ monto: amount, pasarela: "mercadopago" })
      .eq("id", compraId);
  } else {
    const userId = await requireAdmin(req);
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    amount = 1;
    title = "Pago de prueba — Monje Urbano Libre";
    externalReference = crypto.randomUUID();
  }

  // Mercado Pago rechaza auto_return si back_urls.success no es una URL
  // pública en https (localhost no sirve) — en desarrollo local lo omitimos
  // y la vuelta al sitio queda manual (el checkout igual muestra un botón).
  const esLocal = SITE_URL.includes("localhost");

  let result;
  try {
    const preference = new Preference(mpClient);
    result = await preference.create({
      body: {
        items: [
          {
            id: externalReference,
            title,
            quantity: 1,
            unit_price: amount,
            currency_id: "ARS",
          },
        ],
        external_reference: externalReference,
        notification_url: `${SITE_URL}/api/webhooks/mercadopago`,
        back_urls: {
          success: `${SITE_URL}/pedir/gracias`,
          pending: `${SITE_URL}/pedir/gracias`,
          failure: `${SITE_URL}/pedir/error`,
        },
        ...(esLocal ? {} : { auto_return: "approved" as const }),
      },
    });
  } catch (err) {
    console.error("Mercado Pago preference.create falló:", err);
    return NextResponse.json({ error: "No se pudo crear la preferencia de pago" }, { status: 502 });
  }

  if (!result.init_point) {
    return NextResponse.json({ error: "Mercado Pago no devolvió una URL de pago" }, { status: 502 });
  }

  return NextResponse.json({ initPoint: result.init_point });
}
