import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

interface CompraResumen {
  estado: string;
  modalidad: string | null;
  moneda: string;
  monto: number | null;
  como_supiste: string | null;
  comprobante_transferencia_url: string | null;
  creado_en: string;
  pagado_en: string | null;
}

/**
 * Agrega ventas/pedidos/consultas server-side y devuelve solo números ya
 * calculados — nunca las filas crudas, para no exponer datos de compradores
 * al cliente admin de más de lo necesario para el dashboard.
 */
export async function GET(req: NextRequest) {
  const userId = await requireAdmin(req);
  if (!userId || !supabaseAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const dosMesesAtras = new Date();
  dosMesesAtras.setMonth(dosMesesAtras.getMonth() - 2);

  const { data: compras, error: errorCompras } = await supabaseAdmin
    .from("compras")
    .select("estado, modalidad, moneda, monto, como_supiste, comprobante_transferencia_url, creado_en, pagado_en")
    .gte("creado_en", dosMesesAtras.toISOString());

  const { data: consultas, error: errorConsultas } = await supabaseAdmin
    .from("consultas")
    .select("respondido_en");

  if (errorCompras || errorConsultas) {
    return NextResponse.json({ error: (errorCompras ?? errorConsultas)?.message }, { status: 500 });
  }

  const filas = (compras ?? []) as CompraResumen[];
  const ahora = new Date();
  const inicioMesActual = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const inicioProximoMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 1);
  const inicioMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);

  function ventasPorMoneda(desde: Date, hasta: Date) {
    const totales: Record<string, number> = { ARS: 0, USD: 0 };
    for (const c of filas) {
      if (!c.pagado_en || !c.monto) continue;
      const fecha = new Date(c.pagado_en);
      if (fecha >= desde && fecha < hasta) {
        totales[c.moneda] = (totales[c.moneda] ?? 0) + Number(c.monto);
      }
    }
    return totales;
  }

  const pedidosPorEstado: Record<string, number> = {};
  const comoSupisteConteo: Record<string, number> = {};
  let transferenciasSinComprobante = 0;
  let pedidosAbandonados = 0;
  const limiteAbandono = new Date(ahora.getTime() - 48 * 60 * 60 * 1000);

  for (const c of filas) {
    pedidosPorEstado[c.estado] = (pedidosPorEstado[c.estado] ?? 0) + 1;

    const fuente = c.como_supiste?.trim() || "Sin dato";
    comoSupisteConteo[fuente] = (comoSupisteConteo[fuente] ?? 0) + 1;

    if (c.modalidad === "transferencia" && c.estado === "pendiente_pago" && !c.comprobante_transferencia_url) {
      transferenciasSinComprobante += 1;
    }
    if (c.estado === "pendiente_pago" && c.modalidad !== "transferencia" && new Date(c.creado_en) < limiteAbandono) {
      pedidosAbandonados += 1;
    }
  }

  const topComoSupiste = Object.entries(comoSupisteConteo)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([fuente, cantidad]) => ({ fuente, cantidad }));

  const consultasSinResponder = (consultas ?? []).filter((c) => !c.respondido_en).length;

  return NextResponse.json({
    ventas: {
      mesActual: ventasPorMoneda(inicioMesActual, inicioProximoMes),
      mesAnterior: ventasPorMoneda(inicioMesAnterior, inicioMesActual),
    },
    pedidosPorEstado,
    topComoSupiste,
    consultasSinResponder,
    transferenciasSinComprobante,
    pedidosAbandonados,
  });
}
