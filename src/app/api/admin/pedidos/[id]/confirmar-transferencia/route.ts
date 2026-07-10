import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { confirmarPago } from "@/lib/confirmarPago";

/**
 * El admin tilda esto a mano desde /admin cuando ve que la transferencia
 * bancaria efectivamente entró — no hay forma automática de confirmarlo,
 * a diferencia de Mercado Pago/PayPal que avisan solos.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireAdmin(req);
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const resultado = await confirmarPago(id);
  if (!resultado.ok) {
    return NextResponse.json({ error: "No se pudo confirmar el pago" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, yaProcesado: resultado.yaProcesado });
}
