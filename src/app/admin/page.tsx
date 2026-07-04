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
  const [tab, setTab] = useState<"precios" | "pedidos" | "regalar">("pedidos");

  return (
    <div className="form-plain" style={{ maxWidth: 1000 }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
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
          className={tab === "regalar" ? "btn-primary" : "btn-secondary"}
          style={{ padding: "8px 22px" }}
          onClick={() => setTab("regalar")}
        >
          Regalar
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

      {tab === "pedidos" && <PedidosPanel session={session} />}
      {tab === "regalar" && <RegalarPanel session={session} />}
      {tab === "precios" && <PreciosPanel />}
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

const SERVICIOS_REGALABLES = [
  { id: "manifiesto", label: "Manifiesto Personalizado" },
  { id: "cartografia", label: "Cartografía del Síntoma" },
  { id: "magia_sanadora", label: "Magia Sanadora" },
  { id: "ritual_matutino", label: "Ritual Matutino Personalizado" },
];

function RegalarPanel({ session }: { session: Session }) {
  const [servicio, setServicio] = useState(SERVICIOS_REGALABLES[0].id);
  const [destinatarioNombre, setDestinatarioNombre] = useState("");
  const [destinatarioApellido, setDestinatarioApellido] = useState("");
  const [destinatarioEmail, setDestinatarioEmail] = useState("");
  const [destinatarioWhatsapp, setDestinatarioWhatsapp] = useState("");
  const [motivo, setMotivo] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreando(true);
    setLink(null);
    const res = await fetch("/api/admin/regalos", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({
        servicio,
        destinatarioNombre,
        destinatarioApellido,
        destinatarioEmail,
        destinatarioWhatsapp,
        motivo,
      }),
    });
    setCreando(false);
    if (!res.ok) {
      setError("No se pudo generar el link. Probá de nuevo.");
      return;
    }
    const { token } = await res.json();
    setLink(`${window.location.origin}/completar/${token}`);
  }

  function copiar() {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  }

  return (
    <div>
      <div className="form-header">
        <h1>Regalar</h1>
        <p>
          Generá un link de regalo sin pago real — para regalos personales, colaboraciones, o
          para juntar las primeras Semillas del Camino. Quien lo reciba completa su formulario
          en <code>/completar/…</code> sin tener que pagar nada.
        </p>
      </div>

      {error && <p style={{ color: "#ff6666", fontSize: "0.85rem", marginBottom: 16 }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="required">Servicio</label>
          <div className="checkbox-group" style={{ marginTop: 4 }}>
            {SERVICIOS_REGALABLES.map((s) => (
              <label key={s.id} style={{ cursor: "pointer" }}>
                <input
                  type="radio"
                  name="servicio-regalo"
                  checked={servicio === s.id}
                  onChange={() => setServicio(s.id)}
                />
                <span>{s.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Nombre del destinatario (opcional)</label>
            <input type="text" value={destinatarioNombre} onChange={(e) => setDestinatarioNombre(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Apellido (opcional)</label>
            <input type="text" value={destinatarioApellido} onChange={(e) => setDestinatarioApellido(e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="required">Email del destinatario</label>
            <input
              type="email"
              required
              value={destinatarioEmail}
              onChange={(e) => setDestinatarioEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="required">WhatsApp del destinatario</label>
            <input
              type="tel"
              required
              placeholder="+54 9 11 ..."
              value={destinatarioWhatsapp}
              onChange={(e) => setDestinatarioWhatsapp(e.target.value)}
            />
          </div>
        </div>
        <p className="hint" style={{ marginTop: -10, marginBottom: 18 }}>
          Por ahora el link lo enviás vos a mano por el canal que prefieras — más adelante vamos a
          poder mandarlo automático a estos datos.
        </p>

        <div className="form-group">
          <label>Motivo (opcional, solo para vos)</label>
          <input
            type="text"
            placeholder="Ej: Colaboración con @tal, regalo personal, semilla inicial..."
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
        </div>

        <button type="submit" className="btn-primary" disabled={creando}>
          {creando ? "Generando…" : "Generar link de regalo"}
        </button>
      </form>

      {link && (
        <div className="form-section" style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: "1rem" }}>Listo, mandale este link</h2>
          <p style={{ wordBreak: "break-all", color: "#ccc", fontSize: "0.9rem" }}>{link}</p>
          <button type="button" className="btn-secondary" onClick={copiar}>
            {copiado ? "Copiado ✓" : "Copiar link"}
          </button>
        </div>
      )}
    </div>
  );
}
