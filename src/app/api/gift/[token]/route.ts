import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * Public endpoint, but safe: it looks up a single row by its (secret,
 * unguessable) token server-side with the service_role key, and only
 * returns the handful of fields the /completar/[token] page needs — never
 * the buyer's own data or any other order.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Backend no configurado" }, { status: 503 });
  }
  const { token } = await params;

  const { data, error } = await supabaseAdmin
    .from("compras")
    .select("servicio, estado, destinatario_email")
    .eq("token", token)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json({ compra: data });
}
