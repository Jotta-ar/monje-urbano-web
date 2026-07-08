import { NextRequest, NextResponse } from "next/server";
import { enviarEmail } from "@/lib/resend";
import { emailAvisoConsulta } from "@/lib/emailTemplates";

const INFO_EMAIL = process.env.INFO_EMAIL || "info@monjeurbanolibre.com";

/**
 * El insert de la consulta en sí lo hace el navegador directo contra Supabase
 * (con la anon key, ya permitido por RLS) — esta ruta solo se encarga de
 * mandar el aviso por mail, porque eso necesita el secret de Resend, que no
 * puede vivir en el navegador.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.email || !body?.mensaje) {
    return NextResponse.json({ error: "Faltan datos de la consulta" }, { status: 400 });
  }

  await enviarEmail({
    to: INFO_EMAIL,
    ...emailAvisoConsulta({
      nombre: body.nombre ?? "",
      apellido: body.apellido ?? "",
      email: body.email,
      whatsapp: body.whatsapp ?? "",
      mensaje: body.mensaje,
      servicio: body.servicio || null,
      pais: body.pais || null,
      ciudad: body.ciudad || null,
    }),
  });

  return NextResponse.json({ ok: true });
}
