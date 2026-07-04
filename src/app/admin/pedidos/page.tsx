"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import AdminGate from "@/components/admin/AdminGate";

interface Pedido {
  id: string;
  servicio: string;
  modalidad: string | null;
  es_regalo: boolean;
  estado: string;
  comprador_nombre: string | null;
  comprador_apellido: string | null;
  comprador_email: string | null;
  destinatario_nombre: string | null;
  destinatario_apellido: string | null;
  moneda: string;
  monto: number | null;
  enviado: boolean;
  creado_en: string;
}

const SERVICIO_LABELS: Record<string, string> = {
  manifiesto: "Manifiesto Personalizado",
  manifiesto_descarga_gratuita: "Descarga gratuita del Manifiesto",
  cartografia: "Cartografía del Síntoma",
  magia_sanadora: "Magia Sanadora",
  ritual_matutino: "Ritual Matutino Personalizado",
};

const ESTADO_LABELS: Record<string, string> = {
  pendiente_pago: "Pendiente de pago",
  pagado_pendiente_formulario: "Pagado, esperando formulario",
  completado: "Completado",
};

export default function PedidosAdminPage() {
  return <AdminGate>{(session) => <PedidosPanel session={session} />}</AdminGate>;
}

function PedidosPanel({ session }: { session: Session }) {
  const [pedidos, setPedidos] = useState<Pedido[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [soloPendientes, setSoloPendientes] = useState(true);
  const token = session.access_token;

  async function cargar() {
    setError(null);
    const res = await fetch("/api/admin/pedidos", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      setError("No se pudieron cargar los pedidos.");
      return;
    }
    const { pedidos } = await res.json();
    setPedidos(pedidos);
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function marcarEnviado(id: string, enviado: boolean) {
    setPedidos((prev) => prev?.map((p) => (p.id === id ? { ...p, enviado } : p)) ?? null);
    const res = await fetch(`/api/admin/pedidos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ enviado }),
    });
    if (!res.ok) {
      setError("No se pudo actualizar ese pedido, probá de nuevo.");
      cargar();
    }
  }

  async function descargarPdf(id: string) {
    const res = await fetch(`/api/admin/pedidos/${id}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      setError("No se pudo generar el PDF de ese pedido.");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pedido-${id.slice(0, 8)}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const visibles = pedidos?.filter((p) => !soloPendientes || !p.enviado) ?? [];

  return (
    <div className="form-plain" style={{ maxWidth: 1000 }}>
      <div className="form-header">
        <h1>Pedidos</h1>
        <p>Todos los pedidos recibidos. Tildá &quot;Enviado&quot; cuando ya lo entregaste.</p>
      </div>

      {error && <p style={{ color: "#ff6666", fontSize: "0.85rem", marginBottom: 16 }}>{error}</p>}

      <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: "0.9rem", color: "#ccc" }}>
        <input
          type="checkbox"
          checked={soloPendientes}
          onChange={(e) => setSoloPendientes(e.target.checked)}
        />
        Mostrar solo los pendientes de enviar
      </label>

      {pedidos === null && <p style={{ color: "#888" }}>Cargando…</p>}
      {pedidos !== null && visibles.length === 0 && (
        <p style={{ color: "#888" }}>No hay pedidos {soloPendientes ? "pendientes" : "todavía"}.</p>
      )}

      {visibles.map((p) => {
        const nombre = p.es_regalo
          ? `${p.destinatario_nombre ?? "?"} ${p.destinatario_apellido ?? ""} (regalo de ${p.comprador_nombre ?? "?"})`
          : `${p.comprador_nombre ?? "?"} ${p.comprador_apellido ?? ""}`;
        return (
          <div
            key={p.id}
            className="form-section"
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}
          >
            <div>
              <h2 style={{ fontSize: "1.05rem", marginBottom: 4 }}>
                {SERVICIO_LABELS[p.servicio] ?? p.servicio}
                {p.modalidad ? ` — ${p.modalidad}` : ""}
              </h2>
              <p style={{ color: "#999", fontSize: "0.85rem", margin: 0 }}>{nombre}</p>
              <p style={{ color: "#777", fontSize: "0.8rem", margin: "4px 0 0" }}>
                {ESTADO_LABELS[p.estado] ?? p.estado} · {new Date(p.creado_en).toLocaleString("es-AR")}
                {p.monto ? ` · ${p.monto} ${p.moneda}` : ""}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <button type="button" className="btn-secondary" onClick={() => descargarPdf(p.id)}>
                Descargar PDF
              </button>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", color: "#ccc" }}>
                <input
                  type="checkbox"
                  checked={p.enviado}
                  onChange={(e) => marcarEnviado(p.id, e.target.checked)}
                />
                Enviado
              </label>
            </div>
          </div>
        );
      })}
    </div>
  );
}
