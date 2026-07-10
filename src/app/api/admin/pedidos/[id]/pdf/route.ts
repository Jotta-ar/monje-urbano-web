import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import PedidoPdfDocument from "@/lib/PedidoPdfDocument";
import { nombreArchivoPedido } from "@/lib/pedidoFilename";

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

  let comprobante: { data: Buffer; format: "png" | "jpg" } | undefined;
  if (pedido.comprobante_transferencia_url) {
    const { data: archivo } = await supabaseAdmin.storage
      .from("adjuntos")
      .download(pedido.comprobante_transferencia_url);
    if (archivo) {
      const ext = pedido.comprobante_transferencia_url.split(".").pop()?.toLowerCase();
      comprobante = {
        data: Buffer.from(await archivo.arrayBuffer()),
        format: ext === "jpg" || ext === "jpeg" ? "jpg" : "png",
      };
    }
  }

  const buffer = await renderToBuffer(PedidoPdfDocument({ pedido, comprobante }));
  const filename = nombreArchivoPedido(pedido);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
