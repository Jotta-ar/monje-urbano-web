import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Backend no configurado" }, { status: 503 });
  }
  const { token } = await params;
  const datos = await req.json();

  // Solo se puede completar un pedido que exista, sea regalo, y todavía no
  // esté completado — evita que el mismo link se reuse para pisar datos.
  const { data: existente } = await supabaseAdmin
    .from("compras")
    .select("id, estado")
    .eq("token", token)
    .maybeSingle();

  if (!existente) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  if (existente.estado === "completado") {
    return NextResponse.json({ error: "Este link ya fue usado" }, { status: 409 });
  }

  const { error } = await supabaseAdmin
    .from("compras")
    .update({ datos, estado: "completado", completado_en: new Date().toISOString() })
    .eq("token", token);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
