import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { enviarEmail } from "@/lib/resend";
import { emailRespuestaConsulta } from "@/lib/emailTemplates";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireAdmin(req);
  if (!userId || !supabaseAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const respuesta = (body.respuesta as string)?.trim();
  if (!respuesta) {
    return NextResponse.json({ error: "La respuesta no puede estar vacía" }, { status: 400 });
  }

  const { data: consulta, error: errorConsulta } = await supabaseAdmin
    .from("consultas")
    .select("email, mensaje")
    .eq("id", id)
    .single();

  if (errorConsulta || !consulta) {
    return NextResponse.json({ error: "Consulta no encontrada" }, { status: 404 });
  }

  await enviarEmail({
    to: consulta.email,
    ...emailRespuestaConsulta(consulta.mensaje, respuesta),
  });

  const { error } = await supabaseAdmin
    .from("consultas")
    .update({ respuesta, respondido_en: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
