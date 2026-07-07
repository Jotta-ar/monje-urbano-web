import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { enviarEmail } from "@/lib/resend";
import { emailLinkRegalo } from "@/lib/emailTemplates";

const SERVICIOS_VALIDOS = ["manifiesto", "cartografia", "magia_sanadora", "ritual_matutino"];

/**
 * Crea un regalo "interno" (sin pago real): para regalos personales,
 * colaboraciones, o para juntar las primeras Semillas del Camino. Salta
 * directo al estado "pagado_pendiente_formulario" para que el link de
 * /completar/[token] quede habilitado de inmediato.
 */
export async function POST(req: NextRequest) {
  const userId = await requireAdmin(req);
  if (!userId || !supabaseAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const {
    servicio,
    destinatarioNombre,
    destinatarioApellido,
    destinatarioEmail,
    destinatarioWhatsapp,
    motivo,
  } = body;

  if (!SERVICIOS_VALIDOS.includes(servicio)) {
    return NextResponse.json({ error: "Servicio inválido" }, { status: 400 });
  }
  if (!destinatarioEmail || !destinatarioWhatsapp) {
    return NextResponse.json(
      { error: "Email y WhatsApp del destinatario son obligatorios" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("compras")
    .insert({
      servicio,
      es_regalo: true,
      estado: "pagado_pendiente_formulario",
      comprador_nombre: "Monje Urbano Libre",
      comprador_apellido: "(regalo interno)",
      destinatario_nombre: destinatarioNombre || null,
      destinatario_apellido: destinatarioApellido || null,
      destinatario_email: destinatarioEmail,
      destinatario_whatsapp: destinatarioWhatsapp,
      como_supiste: motivo || null,
      moneda: "ARS",
      monto: 0,
      pagado_en: new Date().toISOString(),
    })
    .select("token, numero")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Error desconocido" }, { status: 500 });
  }

  // Se manda solo — antes había que copiar el link y compartirlo a mano
  // (por WhatsApp o donde sea). El link sigue devolviéndose igual por si
  // hace falta reenviarlo o compartirlo por otro medio.
  await enviarEmail({
    to: destinatarioEmail,
    ...emailLinkRegalo({
      numero: data.numero,
      servicio,
      monto: 0,
      moneda: "ARS",
      es_regalo: true,
      token: data.token,
      comprador_nombre: null,
      comprador_apellido: null,
      comprador_email: null,
      destinatario_nombre: destinatarioNombre || null,
      destinatario_email: destinatarioEmail,
    }),
  });

  return NextResponse.json({ token: data.token });
}
