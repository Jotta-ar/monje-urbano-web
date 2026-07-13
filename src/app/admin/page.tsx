"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import AdminGate from "@/components/admin/AdminGate";
import { nombreArchivoPedido } from "@/lib/pedidoFilename";
import MetricasPanel from "@/components/admin/growth/MetricasPanel";
import RecomendacionesPanel from "@/components/admin/growth/RecomendacionesPanel";

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
  pasarela: string | null;
  comprobante_transferencia_url: string | null;
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
  const [tab, setTab] = useState<
    "metricas" | "recomendaciones" | "precios" | "pedidos" | "regalar" | "pago-prueba" | "consultas" | "transferencia"
  >("metricas");

  return (
    <div className="form-plain" style={{ maxWidth: 1000 }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
        <button
          type="button"
          className={tab === "metricas" ? "btn-primary" : "btn-secondary"}
          style={{ padding: "8px 22px" }}
          onClick={() => setTab("metricas")}
        >
          Métricas
        </button>
        <button
          type="button"
          className={tab === "recomendaciones" ? "btn-primary" : "btn-secondary"}
          style={{ padding: "8px 22px" }}
          onClick={() => setTab("recomendaciones")}
        >
          Recomendaciones
        </button>
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
        <button
          type="button"
          className={tab === "pago-prueba" ? "btn-primary" : "btn-secondary"}
          style={{ padding: "8px 22px" }}
          onClick={() => setTab("pago-prueba")}
        >
          Pago de prueba
        </button>
        <button
          type="button"
          className={tab === "consultas" ? "btn-primary" : "btn-secondary"}
          style={{ padding: "8px 22px" }}
          onClick={() => setTab("consultas")}
        >
          Consultas
        </button>
        <button
          type="button"
          className={tab === "transferencia" ? "btn-primary" : "btn-secondary"}
          style={{ padding: "8px 22px" }}
          onClick={() => setTab("transferencia")}
        >
          Transferencia / USDT
        </button>
      </div>

      {tab === "metricas" && <MetricasPanel session={session} onIrARecomendaciones={() => setTab("recomendaciones")} />}
      {tab === "recomendaciones" && <RecomendacionesPanel session={session} />}
      {tab === "pedidos" && <PedidosPanel session={session} />}
      {tab === "regalar" && <RegalarPanel session={session} />}
      {tab === "precios" && <PreciosPanel />}
      {tab === "pago-prueba" && <PagoPruebaPanel session={session} />}
      {tab === "consultas" && <ConsultasPanel session={session} />}
      {tab === "transferencia" && <TransferenciaConfigPanel />}
    </div>
  );
}

function TransferenciaConfigPanel() {
  const [datos, setDatos] = useState("");
  const [walletUsdt, setWalletUsdt] = useState("");
  const [cargado, setCargado] = useState(false);
  const [guardadoId, setGuardadoId] = useState<"banco" | "usdt" | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("configuracion")
      .select("datos_transferencia_usd, wallet_usdt_trc20")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        setDatos(data?.datos_transferencia_usd ?? "");
        setWalletUsdt(data?.wallet_usdt_trc20 ?? "");
        setCargado(true);
      });
  }, []);

  async function handleGuardar(campo: "banco" | "usdt") {
    if (!supabase) return;
    setSaveError(null);
    const { error } = await supabase
      .from("configuracion")
      .update(
        campo === "banco"
          ? { datos_transferencia_usd: datos, actualizado_en: new Date().toISOString() }
          : { wallet_usdt_trc20: walletUsdt, actualizado_en: new Date().toISOString() }
      )
      .eq("id", 1);
    if (error) {
      console.error("configuracion update failed:", error);
      setSaveError(error.message);
      return;
    }
    setGuardadoId(campo);
    setTimeout(() => setGuardadoId(null), 1500);
  }

  return (
    <div>
      <div className="form-header">
        <h1>Transferencia / USDT (USD)</h1>
        <p>Estos datos se le muestran a cualquier cliente del exterior que elija pagar por transferencia o cripto.</p>
      </div>
      {!cargado ? (
        <p style={{ color: "#888" }}>Cargando…</p>
      ) : (
        <>
          <div className="form-section">
            <div className="form-group">
              <label>Datos de la cuenta bancaria</label>
              <textarea
                rows={8}
                value={datos}
                onChange={(e) => setDatos(e.target.value)}
                placeholder="Banco, número de cuenta, routing number, SWIFT, titular, dirección..."
              />
              <p className="hint">
                Mientras esto quede vacío, el cliente ve un mensaje avisando que le vamos a mandar los
                datos por WhatsApp o mail.
              </p>
            </div>
            <button type="button" className="btn-secondary" onClick={() => handleGuardar("banco")}>
              {guardadoId === "banco" ? "Guardado ✓" : "Guardar"}
            </button>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label>Wallet USDT (red TRC20)</label>
              <input
                type="text"
                value={walletUsdt}
                onChange={(e) => setWalletUsdt(e.target.value)}
                placeholder="Dirección de wallet TRC20 (Tron)"
              />
              <p className="hint">
                Usá una dirección de la red TRC20 — es la que tiene comisiones más bajas para el
                cliente. Mientras quede vacío, ve el mismo mensaje de "te contactamos" que la transferencia.
              </p>
            </div>
            <button type="button" className="btn-secondary" onClick={() => handleGuardar("usdt")}>
              {guardadoId === "usdt" ? "Guardado ✓" : "Guardar"}
            </button>
          </div>

          {saveError && <p style={{ color: "#e88", marginTop: 8 }}>{saveError}</p>}
        </>
      )}
    </div>
  );
}

function PagoPruebaPanel({ session }: { session: Session }) {
  const [status, setStatus] = useState<"idle" | "creando" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleProbar() {
    setStatus("creando");
    setError(null);
    try {
      const res = await fetch("/api/mercadopago/crear-preferencia", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok || !data.initPoint) {
        setError(data.error ?? "Error desconocido");
        setStatus("error");
        return;
      }
      window.location.href = data.initPoint;
    } catch (err) {
      console.error("pago de prueba falló:", err);
      setError("Fallo de conexión");
      setStatus("error");
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 12 }}>Pago de prueba — $30.000 ARS</h2>
      <p style={{ color: "#999", maxWidth: 560, marginBottom: 20 }}>
        Sirve para confirmar que la integración con Mercado Pago funciona de punta a punta (se crea
        la preferencia, se completa el pago, y el webhook responde) antes de habilitarla en los
        botones de compra reales. Usá las tarjetas de prueba de Mercado Pago si estás con las
        credenciales de TEST — no se cobra nada real.
      </p>
      <button type="button" className="btn-primary" onClick={handleProbar} disabled={status === "creando"}>
        {status === "creando" ? "Generando…" : "Pagar $30.000 de prueba"}
      </button>
      {error && <p style={{ color: "#e88", marginTop: 12 }}>{error}</p>}
    </div>
  );
}

interface Consulta {
  id: string;
  servicio: string | null;
  nombre: string;
  apellido: string;
  email: string;
  whatsapp: string;
  mensaje: string;
  pais: string | null;
  ciudad: string | null;
  respuesta: string | null;
  respondido_en: string | null;
  creado_en: string;
}

function ConsultasPanel({ session }: { session: Session }) {
  const [consultas, setConsultas] = useState<Consulta[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<"pendientes" | "respondidas">("pendientes");
  const token = session.access_token;

  async function cargar() {
    setError(null);
    const res = await fetch("/api/admin/consultas", { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      setError("No se pudieron cargar las consultas.");
      return;
    }
    const { consultas } = await res.json();
    setConsultas(consultas);
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pendientes = consultas?.filter((c) => !c.respondido_en) ?? [];
  const respondidas = consultas?.filter((c) => c.respondido_en) ?? [];
  const visibles = subTab === "pendientes" ? pendientes : respondidas;

  return (
    <div>
      <div className="form-header">
        <h1>Consultas</h1>
        <p>Respondé desde acá — el mail sale automáticamente a quien consultó.</p>
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
          className={subTab === "respondidas" ? "btn-primary" : "btn-secondary"}
          style={{ padding: "6px 18px", fontSize: "0.85rem" }}
          onClick={() => setSubTab("respondidas")}
        >
          Respondidas ({respondidas.length})
        </button>
      </div>

      {consultas === null && <p style={{ color: "#888" }}>Cargando…</p>}
      {consultas !== null && visibles.length === 0 && (
        <p style={{ color: "#888" }}>
          {subTab === "pendientes" ? "No hay consultas pendientes. ✨" : "Todavía no respondiste ninguna consulta."}
        </p>
      )}

      {visibles.map((c) => (
        <ConsultaRow key={c.id} consulta={c} token={token} onRespondida={cargar} />
      ))}
    </div>
  );
}

function ConsultaRow({
  consulta: c,
  token,
  onRespondida,
}: {
  consulta: Consulta;
  token: string;
  onRespondida: () => void;
}) {
  const [respuesta, setRespuesta] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // La dirección del "to" no se codifica (la @ codificada como %40 rompe
  // el link en varios clientes de correo) — solo el subject.
  const mailtoReply = `mailto:${c.email}?subject=${encodeURIComponent(
    "Re: tu consulta a Monje Urbano Libre"
  )}`;

  async function enviarRespuesta() {
    if (!respuesta.trim()) return;
    setEnviando(true);
    setError(null);
    const res = await fetch(`/api/admin/consultas/${c.id}/responder`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ respuesta }),
    });
    setEnviando(false);
    if (!res.ok) {
      setError("No se pudo enviar la respuesta, probá de nuevo.");
      return;
    }
    onRespondida();
  }

  return (
    <div className="form-section">
      <h2 style={{ fontSize: "1.05rem", marginBottom: 4 }}>
        {c.nombre} {c.apellido}
        {c.servicio ? ` — ${c.servicio}` : ""}
      </h2>
      <p style={{ color: "#999", fontSize: "0.85rem", margin: 0 }}>
        {c.email} · {c.whatsapp}
        {(c.pais || c.ciudad) && ` · ${[c.ciudad, c.pais].filter(Boolean).join(", ")}`}
      </p>
      <p style={{ color: "#777", fontSize: "0.8rem", margin: "4px 0 12px" }}>
        {new Date(c.creado_en).toLocaleString("es-AR")}
      </p>
      <p style={{ whiteSpace: "pre-wrap", color: "#ddd", marginBottom: 12 }}>{c.mensaje}</p>

      {c.respondido_en ? (
        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 4, padding: 14 }}>
          <p style={{ fontSize: "0.75rem", color: "#888", margin: "0 0 6px" }}>
            Respondida el {new Date(c.respondido_en).toLocaleString("es-AR")}
          </p>
          <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{c.respuesta}</p>
        </div>
      ) : (
        <>
          <textarea
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            placeholder="Escribí tu respuesta…"
            style={{ width: "100%", minHeight: 90, marginBottom: 10 }}
          />
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn-primary"
              onClick={enviarRespuesta}
              disabled={enviando || !respuesta.trim()}
            >
              {enviando ? "Enviando…" : "Enviar respuesta"}
            </button>
            <a href={mailtoReply} className="btn-secondary" style={{ fontSize: "0.85rem" }}>
              Responder por mail
            </a>
          </div>
          {error && <p style={{ color: "#e88", marginTop: 8 }}>{error}</p>}
        </>
      )}
    </div>
  );
}

const SERVICIOS_ORDEN = [
  "magia_unica",
  "magia_serie3",
  "magia_serie6",
  "magia_serie9",
  "manifiesto",
  "cartografia_pdf",
  "cartografia_combo",
  "ritual_matutino",
];
const PRODUCTOS_ORDEN = ["talisman", "porta_sahumerio"];

function PreciosPanel() {
  const [precios, setPrecios] = useState<PrecioRow[]>([]);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("precios")
      .select("id, label, monto_ars, monto_usd")
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

  function actualizar(id: string, campo: "monto_ars" | "monto_usd", valor: string) {
    setPrecios((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [campo]: valor ? Number(valor) : null } : r))
    );
  }

  function fila(id: string) {
    const row = precios.find((p) => p.id === id);
    if (!row) return null;
    return (
      <div className="form-section" key={row.id}>
        <h2 style={{ fontSize: "1.1rem" }}>{row.label}</h2>
        <div className="form-row">
          <div className="form-group">
            <label>Monto ARS</label>
            <input
              type="number"
              value={row.monto_ars ?? ""}
              onChange={(e) => actualizar(row.id, "monto_ars", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Monto USD</label>
            <input
              type="number"
              value={row.monto_usd ?? ""}
              onChange={(e) => actualizar(row.id, "monto_usd", e.target.value)}
            />
          </div>
        </div>
        <button type="button" className="btn-secondary" onClick={() => handleSave(row)}>
          {savedId === row.id ? "Guardado ✓" : "Guardar"}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="form-header">
        <h1>Precios</h1>
        <p>Editá los montos y guardá cada fila.</p>
      </div>

      {saveError && <p style={{ color: "#ff6666", fontSize: "0.85rem", marginBottom: 16 }}>{saveError}</p>}

      {precios.length > 0 && (
        <>
          <h2 style={{ fontSize: "1.3rem", marginTop: 8, marginBottom: 4, color: "#eee" }}>Servicios</h2>
          {SERVICIOS_ORDEN.map(fila)}

          <h2 style={{ fontSize: "1.3rem", marginTop: 32, marginBottom: 4, color: "#eee" }}>Productos</h2>
          {PRODUCTOS_ORDEN.map(fila)}
        </>
      )}
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

  async function confirmarTransferencia(id: string) {
    const res = await fetch(`/api/admin/pedidos/${id}/confirmar-transferencia`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      setError("No se pudo confirmar la transferencia, probá de nuevo.");
      return;
    }
    cargar();
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

  // Dentro de "Pendientes", separar lo que ya tiene el formulario completo
  // (listo para trabajar) de los regalos generados que todavía esperan que
  // el beneficiario complete su formulario.
  const paraHacer = visibles.filter((p) => p.estado === "completado");
  const regalosPendientes = visibles.filter((p) => p.estado !== "completado");

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

      {subTab === "pendientes" ? (
        <>
          {paraHacer.length > 0 && (
            <>
              <h3 style={{ fontSize: "0.95rem", color: "#ccc", margin: "0 0 12px" }}>
                Pedidos para hacer ({paraHacer.length})
              </h3>
              {paraHacer.map((p) => (
                <PedidoRow key={p.id} pedido={p} onDescargarPdf={descargarPdf} onMarcarEnviado={marcarEnviado} onConfirmarTransferencia={confirmarTransferencia} />
              ))}
            </>
          )}

          {regalosPendientes.length > 0 && (
            <>
              <h3 style={{ fontSize: "0.95rem", color: "#888", margin: paraHacer.length > 0 ? "28px 0 12px" : "0 0 12px" }}>
                Regalos generados, esperando formulario ({regalosPendientes.length})
              </h3>
              <p style={{ color: "#777", fontSize: "0.8rem", marginTop: -6, marginBottom: 12 }}>
                Todavía no llegan a tu lista de trabajo — si un regalo lleva varios días acá, reenviaselo al
                destinatario desde la pestaña &quot;Regalar&quot; para recordarle completarlo.
              </p>
              {regalosPendientes.map((p) => (
                <PedidoRow key={p.id} pedido={p} onDescargarPdf={descargarPdf} onMarcarEnviado={marcarEnviado} onConfirmarTransferencia={confirmarTransferencia} />
              ))}
            </>
          )}
        </>
      ) : (
        visibles.map((p) => (
          <PedidoRow key={p.id} pedido={p} onDescargarPdf={descargarPdf} onMarcarEnviado={marcarEnviado} onConfirmarTransferencia={confirmarTransferencia} />
        ))
      )}
    </div>
  );
}

function PedidoRow({
  pedido: p,
  onDescargarPdf,
  onMarcarEnviado,
  onConfirmarTransferencia,
}: {
  pedido: Pedido;
  onDescargarPdf: (pedido: Pedido) => void;
  onMarcarEnviado: (id: string, enviado: boolean) => void;
  onConfirmarTransferencia: (id: string) => void;
}) {
  const nombre = p.es_regalo
    ? `${p.destinatario_nombre ?? "?"} ${p.destinatario_apellido ?? ""} (regalo de ${p.comprador_nombre ?? "?"})`
    : `${p.comprador_nombre ?? "?"} ${p.comprador_apellido ?? ""}`;
  const formularioListo = p.estado === "completado";
  const esperandoPagoManual =
    (p.pasarela === "transferencia" || p.pasarela === "usdt") && p.estado === "pendiente_pago";
  const etiquetaPagoManual = p.pasarela === "usdt" ? "Esperando USDT" : "Esperando transferencia";

  return (
    <div
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
          {esperandoPagoManual ? etiquetaPagoManual : ESTADO_LABELS[p.estado] ?? p.estado} ·{" "}
          {new Date(p.creado_en).toLocaleString("es-AR")}
          {p.monto ? ` · ${p.monto} ${p.moneda}` : ""}
          {esperandoPagoManual && p.comprobante_transferencia_url ? " · comprobante adjunto en el PDF" : ""}
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button type="button" className="btn-secondary" onClick={() => onDescargarPdf(p)}>
          Descargar PDF
        </button>
        {formularioListo && (
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", color: "#ccc" }}>
            <input
              type="checkbox"
              checked={p.enviado}
              onChange={(e) => onMarcarEnviado(p.id, e.target.checked)}
            />
            Enviado
          </label>
        )}
        {esperandoPagoManual && (
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", color: "#ccc" }}>
            <input type="checkbox" checked={false} onChange={() => onConfirmarTransferencia(p.id)} />
            Confirmar {p.pasarela === "usdt" ? "USDT recibido" : "transferencia recibida"}
          </label>
        )}
      </div>
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
    try {
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
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "No se pudo generar el link. Probá de nuevo.");
        return;
      }
      const { token } = await res.json();
      setLink(`${window.location.origin}/completar/${token}`);
    } catch (err) {
      console.error("crear regalo failed:", err);
      setError("No se pudo generar el link (problema de conexión). Probá de nuevo.");
    } finally {
      setCreando(false);
    }
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
          <div className="radio-group" style={{ marginTop: 4 }}>
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
