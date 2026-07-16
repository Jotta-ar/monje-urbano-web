import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

const ESTADOS = ["borrador", "aprobada", "publicada", "descartada"];
const VOZ_PROVIDERS = ["piper", "elevenlabs"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireAdmin(req);
  if (!userId || !supabaseAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);

  const cambios: Record<string, unknown> = {};

  if (body?.estado !== undefined) {
    if (!ESTADOS.includes(body.estado)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }
    cambios.estado = body.estado;
  }

  if (body?.notas !== undefined) {
    cambios.notas = typeof body.notas === "string" ? body.notas.trim() || null : null;
  }

  if (body?.vozProvider !== undefined) {
    if (!VOZ_PROVIDERS.includes(body.vozProvider)) {
      return NextResponse.json({ error: "voz_provider inválido" }, { status: 400 });
    }
    cambios.voz_provider = body.vozProvider;
  }

  // Lo usa el script del ensamblador (scripts/subir-video.mjs), autenticado
  // igual que el resto de /api/admin/* con el token de sesión de Jose.
  if (body?.videoUrl !== undefined) {
    cambios.video_url = typeof body.videoUrl === "string" ? body.videoUrl : null;
  }

  if (Object.keys(cambios).length === 0) {
    return NextResponse.json({ error: "Nada para actualizar" }, { status: 400 });
  }

  cambios.actualizado_en = new Date().toISOString();

  const { error } = await supabaseAdmin.from("contenido_piezas").update(cambios).eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
