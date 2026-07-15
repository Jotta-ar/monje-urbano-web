import { NextRequest, NextResponse } from "next/server";
import { registrarSnapshotYoutube } from "@/lib/youtube";
import { registrarSnapshotTikTok } from "@/lib/tiktok";
import { registrarSnapshotInstagram } from "@/lib/instagram";

/**
 * Único cron para las tres redes, en vez de uno por plataforma — el plan
 * gratis de Vercel (Hobby) limita la cantidad de cron jobs por proyecto, así
 * que conviene un solo disparador diario que llama a las tres funciones en
 * vez de tres entradas separadas en vercel.json. Si una plataforma falla
 * (ej. Instagram sin token todavía), no bloquea a las otras dos.
 */
export async function GET(req: NextRequest) {
  const secretoEsperado = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!secretoEsperado || token !== secretoEsperado) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const [youtube, tiktok, instagram] = await Promise.all([
    registrarSnapshotYoutube(),
    registrarSnapshotTikTok(),
    registrarSnapshotInstagram(),
  ]);

  return NextResponse.json({
    ok: true,
    youtube: youtube ?? { error: "no se pudo" },
    tiktok: tiktok ?? { error: "no se pudo" },
    instagram: instagram ?? { error: "no se pudo" },
  });
}
