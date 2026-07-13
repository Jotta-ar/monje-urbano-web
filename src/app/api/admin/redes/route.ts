import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

const PLATAFORMAS = ["youtube", "instagram", "tiktok"] as const;

export async function GET(req: NextRequest) {
  const userId = await requireAdmin(req);
  if (!userId || !supabaseAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const historico: Record<
    string,
    { seguidores: number | null; publicaciones: number | null; metricaExtra: Record<string, unknown> | null; capturadoEn: string }[]
  > = {};

  for (const plataforma of PLATAFORMAS) {
    const { data, error } = await supabaseAdmin
      .from("redes_metricas")
      .select("seguidores, publicaciones, metrica_extra, capturado_en")
      .eq("plataforma", plataforma)
      .order("capturado_en", { ascending: false })
      .limit(12);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Se invierte a orden cronológico ascendente — así el front puede
    // dibujar la sparkline sin tener que reordenar nada.
    historico[plataforma] = (data ?? [])
      .reverse()
      .map((fila) => ({
        seguidores: fila.seguidores,
        publicaciones: fila.publicaciones,
        metricaExtra: fila.metrica_extra as Record<string, unknown> | null,
        capturadoEn: fila.capturado_en,
      }));
  }

  return NextResponse.json({ historico });
}
