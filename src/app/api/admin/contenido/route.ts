import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

const TIPOS = ["nucleo", "youtube_largo"];
const EJES = ["elevarse", "centrarse", "enraizarse"];

export async function GET(req: NextRequest) {
  const userId = await requireAdmin(req);
  if (!userId || !supabaseAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("contenido_piezas")
    .select("*")
    .order("tanda_fecha", { ascending: false })
    .order("creado_en", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    piezas: data,
    elevenlabsDisponible: Boolean(process.env.ELEVENLABS_API_KEY),
  });
}

/**
 * Alta manual desde el dashboard (Jose cargando una pieza propia). El motor
 * de contenido (skill motor-contenido-redes) NO usa esta ruta — inserta
 * directo con service_role, ver scripts/guardar-tanda.mjs.
 */
export async function POST(req: NextRequest) {
  const userId = await requireAdmin(req);
  if (!userId || !supabaseAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const tipo = typeof body?.tipo === "string" ? body.tipo : null;
  const tandaFecha = typeof body?.tandaFecha === "string" ? body.tandaFecha : null;
  const lineas = Array.isArray(body?.lineas) ? body.lineas : null;

  if (!tipo || !TIPOS.includes(tipo) || !tandaFecha || !lineas) {
    return NextResponse.json({ error: "Faltan tipo, tandaFecha o lineas válidos" }, { status: 400 });
  }
  if (body?.cruceEje && !EJES.includes(body.cruceEje)) {
    return NextResponse.json({ error: "cruceEje inválido" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("contenido_piezas")
    .insert({
      tanda_fecha: tandaFecha,
      tipo,
      cruce_principio: body?.crucePrincipio ?? null,
      cruce_eje: body?.cruceEje ?? null,
      es_cta_directo: Boolean(body?.esCtaDirecto),
      puente_venta: body?.puenteVenta ?? null,
      titulo: body?.titulo ?? null,
      lineas,
      caption: body?.caption ?? null,
      origen: "manual",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ pieza: data });
}
