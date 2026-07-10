import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * Le permite a un cliente volver más tarde (con el link que le dimos en la
 * pantalla de "elegiste transferencia") a ver los datos bancarios y subir el
 * comprobante — no requiere sesión, solo el token (secreto, no adivinable)
 * del pedido. Reusa la misma columna `token` que ya existe para el flujo de
 * regalo, generada en todo insert de `compras` sin importar es_regalo.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Backend no configurado" }, { status: 503 });
  }
  const { token } = await params;

  const { data: compra, error } = await supabaseAdmin
    .from("compras")
    .select("servicio, moneda, pasarela, estado, comprobante_transferencia_url")
    .eq("token", token)
    .maybeSingle();

  if (error) {
    console.error("transferencia [token] GET falló:", error);
  }
  if (error || !compra || compra.pasarela !== "transferencia") {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const { data: config } = await supabaseAdmin
    .from("configuracion")
    .select("datos_transferencia_usd")
    .eq("id", 1)
    .maybeSingle();

  return NextResponse.json({
    servicio: compra.servicio,
    estado: compra.estado,
    tieneComprobante: !!compra.comprobante_transferencia_url,
    datosTransferencia: config?.datos_transferencia_usd ?? null,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Backend no configurado" }, { status: 503 });
  }
  const { token } = await params;
  const body = await req.json().catch(() => ({}));
  const comprobanteUrl = typeof body.comprobanteUrl === "string" ? body.comprobanteUrl : null;
  if (!comprobanteUrl) {
    return NextResponse.json({ error: "Falta el comprobante" }, { status: 400 });
  }

  const { data: existente } = await supabaseAdmin
    .from("compras")
    .select("id, pasarela")
    .eq("token", token)
    .maybeSingle();

  if (!existente || existente.pasarela !== "transferencia") {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const { error } = await supabaseAdmin
    .from("compras")
    .update({ comprobante_transferencia_url: comprobanteUrl })
    .eq("token", token);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
