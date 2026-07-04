import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import PedidoPdfDocument from "@/lib/PedidoPdfDocument";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireAdmin(req);
  if (!userId || !supabaseAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const { data: pedido, error } = await supabaseAdmin
    .from("compras")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !pedido) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  const buffer = await renderToBuffer(PedidoPdfDocument({ pedido }));

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="pedido-${id.slice(0, 8)}.pdf"`,
    },
  });
}
