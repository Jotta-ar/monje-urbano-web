import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

const AREAS = ["ADS", "VTA", "PAG", "ONB", "EML", "CRM", "SUP", "DOC", "CNT", "REP", "SEG"];
const PRIORIDADES = ["alta", "media", "baja"];

export async function GET(req: NextRequest) {
  const userId = await requireAdmin(req);
  if (!userId || !supabaseAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("recomendaciones")
    .select("*")
    .order("creado_en", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ recomendaciones: data });
}

/**
 * Alta manual desde el dashboard (Jose cargando una idea propia). El agente
 * programado (skill asesor-crecimiento-mul) NO usa esta ruta — inserta
 * directo con service_role, ver scripts/agregar-recomendacion.mjs.
 */
export async function POST(req: NextRequest) {
  const userId = await requireAdmin(req);
  if (!userId || !supabaseAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const area = typeof body?.area === "string" ? body.area.toUpperCase() : null;
  const titulo = typeof body?.titulo === "string" ? body.titulo.trim() : "";
  const descripcion = typeof body?.descripcion === "string" ? body.descripcion.trim() : null;
  const prioridad = PRIORIDADES.includes(body?.prioridad) ? body.prioridad : "media";

  if (!area || !AREAS.includes(area) || !titulo) {
    return NextResponse.json({ error: "Falta área válida o título" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("recomendaciones")
    .insert({ area, titulo, descripcion, prioridad, origen: "manual" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ recomendacion: data });
}
