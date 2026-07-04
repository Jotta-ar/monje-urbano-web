"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import AdminGate from "@/components/admin/AdminGate";
import { nombreArchivoPedido } from "@/lib/pedidoFilename";

interface PrecioRow {
  id: string;
  label: string;
  monto_ars: number | null;
  monto_usd: number | null;
}

interface Pedido {
  id: string;
  numero: number;
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

export default function AdminPage() {
  return <AdminGate>{(session) => <AdminTabs session={session} />}</AdminGate>;
}

function AdminTabs({ session }: { session: Session }) {
  const [tab, setTab] = useState<"precios" | "pedidos">("pedidos");

  return (
    <div className="form-plain" style={{ maxWidth: 1000 }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
        <button
          type="button"
          className={tab === "pedidos" ? "btn-primary" : "btn-secondary"}
          style={{ padding: "8px 22px" }}
          onClick={() => setTab("pedidos")}
        >
          Pedidos
        </button>
        <button
          type="button"
          className={tab === "precios" ? "btn-primary" : "btn-secondary"}
          style={{ padding: "8px 22px" }}
          onClick={() => setTab("precios")}
        >
          Precios
        </button>
      </div>

      {tab === "pedidos" ? <PedidosPanel session={session} /> : <PreciosPanel />}
    </div>
  );
}

function PreciosPanel() {
  const [precios, setPrecios] = useState<PrecioRow[]>([]);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("precios")
      .select("id, label, monto_ars, monto_usd")
      .order("id")
      .then(({ data }) => setPrecios(data ?? []));
  }, []);

  async function handleSave(row: PrecioRow) {
    if (!supabase) return;
    setSaveError(null);
    const { error } = await supabase
      .from("precios")
      .update({ monto_ars: row.monto_ars, monto_usd: row.monto_usd, actualizado_en: new Date().toISOString() })
      .eq("id", row.id);
    if (error) {
      console.error("precio update failed:", error);
      setSaveError(`No se pudo guardar "${row.label}": ${error.message}`);
      return;
    }
    setSavedId(row.id);
    setTimeout(() => setSavedId(null), 1500);
  }

  return (
    <div>
      <div className="form-header">
        <h1>Precios</h1>
        <p>Editá los montos y guardá cada fila.</p>
      </div>

      {saveError && <p style={{ color: "#ff6666", fontSize: "0.85rem", marginBottom: 16 }}>{saveError}</p>}

      {precios.map((row, i) => (
        <div className="form-section" key={row.id}>
          <h2 style={{ fontSize: "1.1rem" }}>{row.label}</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Monto ARS</label>
              <input
                type="number"
                value={row.monto_ars ?? ""}
                onChange={(e) => {
                  const next = [...precios];
                  next[i] = { ...row, monto_ars: e.target.value ? Number(e.target.value) : null };
                  setPrecios(next);
                }}
              />
            </div>
            <div className="form-group">
              <label>Monto USD</label>
              <input
                type="number"
                value={row.monto_usd ?? ""}
                onChange={(e) => {
                  const next = [...precios];
                  next[i] = { ...row, monto_usd: e.target.value ? Number(e.target.value) : null };
                  setPrecios(next);
                }}
              />
            </div>
          </div>
          <button type="button" className="btn-secondary" onClick={() => handleSave(precios[i])}>
            {savedId === row.id ? "Guardado ✓" : "Guardar"}
          </button>
        </div>
      ))}
    </div>
  );
}

function PedidosPanel({ session }: { session: Session }) {
  const [pedidos, setPedidos] = useState<Pedido[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<"pendientes" | "completados">("pendientes");
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

  async function descargarPdf(pedido: Pedido) {
    const res = await fetch(`/api/admin/pedidos/${pedido.id}/pdf`, {
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
    a.download = nombreArchivoPedido(pedido);
    a.click();
    URL.revokeObjectURL(url);
  }

  const pendientes = pedidos?.filter((p) => !p.enviado) ?? [];
  const completados = pedidos?.filter((p) => p.enviado) ?? [];
  const visibles = subTab === "pendientes" ? pendientes : completados;

  return (
    <div>
      <div className="form-header">
        <h1>Pedidos</h1>
        <p>Tildá &quot;Enviado&quot; cuando ya lo entregaste — pasa solo a &quot;Completados&quot;.</p>
      </div>

      {error && <p style={{ color: "#ff6666", fontSize: "0.85rem", marginBottom: 16 }}>{error}</p>}

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <button
          type="button"
          className={subTab === "pendientes" ? "btn-primary" : "btn-secondary"}
          style={{ padding: "6px 18px", fontSize: "0.85rem" }}
          onClick={() => setSubTab("pendientes")}
        >
          Pendientes ({pendientes.length})
        </button>
        <button
          type="button"
          className={subTab === "completados" ? "btn-primary" : "btn-secondary"}
          style={{ padding: "6px 18px", fontSize: "0.85rem" }}
          onClick={() => setSubTab("completados")}
        >
          Completados ({completados.length})
        </button>
      </div>

      {pedidos === null && <p style={{ color: "#888" }}>Cargando…</p>}
      {pedidos !== null && visibles.length === 0 && (
        <p style={{ color: "#888" }}>
          {subTab === "pendientes" ? "No hay pedidos pendientes. ✨" : "Todavía no completaste ningún pedido."}
        </p>
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
                #{String(p.numero).padStart(6, "0")} — {SERVICIO_LABELS[p.servicio] ?? p.servicio}
                {p.modalidad ? ` — ${p.modalidad}` : ""}
              </h2>
              <p style={{ color: "#999", fontSize: "0.85rem", margin: 0 }}>{nombre}</p>
              <p style={{ color: "#777", fontSize: "0.8rem", margin: "4px 0 0" }}>
                {ESTADO_LABELS[p.estado] ?? p.estado} · {new Date(p.creado_en).toLocaleString("es-AR")}
                {p.monto ? ` · ${p.monto} ${p.moneda}` : ""}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <button type="button" className="btn-secondary" onClick={() => descargarPdf(p)}>
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
