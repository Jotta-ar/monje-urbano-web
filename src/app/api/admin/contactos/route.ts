import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const userId = await requireAdmin(req);
  if (!userId || !supabaseAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("contactos")
    .select("*")
    .order("ultima_interaccion_en", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const resumen = { lead: 0, consulto: 0, comprador: 0, recurrente: 0 };
  for (const c of data ?? []) {
    if (c.etapa in resumen) resumen[c.etapa as keyof typeof resumen] += 1;
  }

  return NextResponse.json({ contactos: data, resumen });
}
