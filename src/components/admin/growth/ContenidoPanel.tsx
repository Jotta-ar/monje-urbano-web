"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

type Tipo = "nucleo" | "youtube_largo";
type Eje = "elevarse" | "centrarse" | "enraizarse";
type Estado = "borrador" | "aprobada" | "publicada" | "descartada";
type VozProvider = "piper" | "elevenlabs";

interface Linea {
  texto: string;
  estilo: "hook" | "cuerpo" | "cierre";
}

interface Pieza {
  id: string;
  tanda_fecha: string;
  tipo: Tipo;
  cruce_principio: string | null;
  cruce_eje: Eje | null;
  es_cta_directo: boolean;
  puente_venta: string | null;
  titulo: string | null;
  lineas: Linea[];
  caption: string | null;
  voz_provider: VozProvider;
  video_url: string | null;
  estado: Estado;
  origen: "agente" | "manual";
  notas: string | null;
  creado_en: string;
}

const EJE_LABEL: Record<Eje, string> = {
  elevarse: "Elevarse",
  centrarse: "Centrarse",
  enraizarse: "Enraizarse",
};

const TIPO_LABEL: Record<Tipo, string> = {
  nucleo: "Reel · TikTok · Short",
  youtube_largo: "YouTube largo",
};

const ESTADO_LABEL: Record<Estado, string> = {
  borrador: "Sin revisar",
  aprobada: "Aprobada",
  publicada: "Publicada",
  descartada: "Descartada",
};

// Roadmap de automatización de redes (ver diseño de pipeline acordado con Jose).
// Se actualiza a mano acá cuando una fase realmente se conecta — no se deriva
// de "recomendaciones" para no depender de que nadie edite un título ahí.
const ROADMAP: { fase: string; titulo: string; estado: "hecho" | "en_progreso" | "pendiente"; detalle: string }[] = [
  { fase: "Fase 0", titulo: "Motor de contenido", estado: "hecho", detalle: "Curador + guionista + ensamblador, corriendo" },
  { fase: "Fase 1", titulo: "YouTube automático", estado: "pendiente", detalle: "Falta conectar la Data API para publicar solo" },
  { fase: "Fase 2", titulo: "Instagram automático", estado: "pendiente", detalle: "Permiso ya concedido, falta el publicador" },
  { fase: "Fase 3", titulo: "TikTok automático", estado: "pendiente", detalle: "Sandbox — falta pasar revisión de producción" },
];

type Filtro = "revisar" | "aprobada" | "publicada" | "descartada" | "todas";

const FILTROS: { key: Filtro; label: string }[] = [
  { key: "revisar", label: "Para revisar" },
  { key: "aprobada", label: "Aprobadas" },
  { key: "publicada", label: "Publicadas" },
  { key: "descartada", label: "Descartadas" },
  { key: "todas", label: "Todas" },
];

function formatearFecha(fecha: string) {
  return new Date(fecha + "T00:00:00").toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function RoadmapStrip({ onIrARecomendaciones }: { onIrARecomendaciones: () => void }) {
  return (
    <div className="cnt-roadmap">
      {ROADMAP.map((r) => (
        <button
          key={r.fase}
          type="button"
          className="cnt-roadmap-step"
          data-estado={r.estado}
          onClick={onIrARecomendaciones}
        >
          <div className="cnt-roadmap-fase">{r.fase}</div>
          <div className="cnt-roadmap-titulo">{r.titulo}</div>
          <div className="cnt-roadmap-estado">
            {r.estado === "hecho" ? "Hecho" : r.estado === "en_progreso" ? "En curso" : "Pendiente"} — {r.detalle}
          </div>
          <div className="cnt-roadmap-link">Ver en Recomendaciones →</div>
        </button>
      ))}
    </div>
  );
}

function ComentarioBox({ p, onGuardar }: { p: Pieza; onGuardar: (id: string, notas: string) => void }) {
  const [editando, setEditando] = useState(false);
  const [borrador, setBorrador] = useState(p.notas ?? "");

  if (editando) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <textarea
          rows={3}
          value={borrador}
          onChange={(e) => setBorrador(e.target.value)}
          placeholder="Qué ajustar en la próxima tanda (tono, largo, gancho...)"
          style={{ fontSize: "0.9rem" }}
          autoFocus
        />
        <div style={{ display: "flex", gap: 6 }}>
          <button
            type="button"
            className="cnt-btn"
            onClick={() => {
              onGuardar(p.id, borrador.trim());
              setEditando(false);
            }}
          >
            Guardar comentario
          </button>
          <button
            type="button"
            className="cnt-btn"
            onClick={() => {
              setBorrador(p.notas ?? "");
              setEditando(false);
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {p.notas && (
        <p style={{ fontStyle: "italic", color: "var(--muted)", borderLeft: "2px solid var(--border)", paddingLeft: 10, margin: 0 }}>
          {p.notas}
        </p>
      )}
      <button type="button" className="cnt-btn" style={{ alignSelf: "flex-start" }} onClick={() => setEditando(true)}>
        {p.notas ? "Editar comentario" : "Comentar"}
      </button>
    </div>
  );
}

function PiezaCard({
  p,
  elevenlabsDisponible,
  onCambiarEstado,
  onGuardarNota,
  onCambiarVoz,
}: {
  p: Pieza;
  elevenlabsDisponible: boolean;
  onCambiarEstado: (id: string, nuevoEstado: Estado) => void;
  onGuardarNota: (id: string, notas: string) => void;
  onCambiarVoz: (id: string, voz: VozProvider) => void;
}) {
  const [expandido, setExpandido] = useState(false);
  const hook = p.lineas.find((l) => l.estilo === "hook")?.texto ?? p.titulo ?? "(sin hook)";

  return (
    <div className="cnt-card" data-estado={p.estado}>
      <div className="cnt-card-top">
        <span className="chip chip-origen">{TIPO_LABEL[p.tipo]}</span>
        {p.cruce_eje && <span className="chip chip-origen">{EJE_LABEL[p.cruce_eje]}</span>}
        {p.es_cta_directo && <span className="chip chip-prioridad" data-prioridad="alta">CTA directo</span>}
        <span className="cnt-status-pill" data-estado={p.estado}>{ESTADO_LABEL[p.estado]}</span>
      </div>

      <p className="cnt-card-hook">{hook}</p>
      <p className="cnt-card-meta">
        {p.cruce_principio ?? p.titulo}
        {p.notas && <span className="cnt-comentario-flag"> · tiene un comentario tuyo</span>}
      </p>

      {p.estado === "borrador" && (
        <div className="cnt-quick-actions">
          <button type="button" className="cnt-btn aprobar" onClick={() => onCambiarEstado(p.id, "aprobada")}>
            Aprobar
          </button>
          <button type="button" className="cnt-btn descartar" onClick={() => onCambiarEstado(p.id, "descartada")}>
            Descartar
          </button>
        </div>
      )}
      {p.estado === "aprobada" && (
        <div className="cnt-quick-actions">
          <button type="button" className="cnt-btn aprobar" onClick={() => onCambiarEstado(p.id, "publicada")}>
            Marcar publicada
          </button>
          <button type="button" className="cnt-btn" onClick={() => onCambiarEstado(p.id, "borrador")}>
            Volver a revisar
          </button>
        </div>
      )}
      {(p.estado === "publicada" || p.estado === "descartada") && (
        <div className="cnt-quick-actions">
          <button type="button" className="cnt-btn" onClick={() => onCambiarEstado(p.id, "borrador")}>
            Reabrir
          </button>
        </div>
      )}

      <button type="button" className="reco-btn ver-mas" style={{ alignSelf: "flex-start" }} onClick={() => setExpandido((v) => !v)}>
        {expandido ? "Ver menos" : "Ver guion completo"}
      </button>

      {expandido && (
        <>
          <p className="cnt-guion">
            {p.lineas.map((l, i) => (
              <span key={i} className={l.estilo === "cierre" ? "cierre" : undefined}>
                {l.texto}
                {i < p.lineas.length - 1 ? "\n" : ""}
              </span>
            ))}
          </p>

          {p.puente_venta && (
            <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: 0 }}>Puente de venta: {p.puente_venta}</p>
          )}

          {p.video_url && <video controls src={p.video_url} className="cnt-video" />}

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: "0.8rem" }}>Voz</label>
            <div className="radio-group" style={{ display: "flex", gap: 14, marginTop: 4 }}>
              <label style={{ cursor: "pointer" }}>
                <input
                  type="radio"
                  name={`voz-${p.id}`}
                  checked={p.voz_provider === "piper"}
                  onChange={() => onCambiarVoz(p.id, "piper")}
                />
                <span>Piper (gratis)</span>
              </label>
              <label style={{ cursor: elevenlabsDisponible ? "pointer" : "not-allowed", opacity: elevenlabsDisponible ? 1 : 0.5 }}>
                <input
                  type="radio"
                  name={`voz-${p.id}`}
                  checked={p.voz_provider === "elevenlabs"}
                  disabled={!elevenlabsDisponible}
                  onChange={() => onCambiarVoz(p.id, "elevenlabs")}
                />
                <span>ElevenLabs{!elevenlabsDisponible ? " (falta API key)" : ""}</span>
              </label>
            </div>
          </div>

          <ComentarioBox p={p} onGuardar={onGuardarNota} />
        </>
      )}
    </div>
  );
}

export default function ContenidoPanel({
  session,
  onIrARecomendaciones,
}: {
  session: Session;
  onIrARecomendaciones: () => void;
}) {
  const [piezas, setPiezas] = useState<Pieza[] | null>(null);
  const [elevenlabsDisponible, setElevenlabsDisponible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<Filtro>("revisar");
  const token = session.access_token;

  async function cargar() {
    setError(null);
    try {
      const res = await fetch("/api/admin/contenido", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      const { piezas, elevenlabsDisponible } = await res.json();
      setPiezas(piezas);
      setElevenlabsDisponible(elevenlabsDisponible);
    } catch {
      setError("No se pudieron cargar las piezas de contenido.");
    }
  }

  useEffect(() => {
    async function cargarInicial() {
      await cargar();
    }
    cargarInicial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function actualizar(id: string, cambios: Record<string, unknown>, campoLocal: Partial<Pieza>) {
    setPiezas((prev) => prev?.map((p) => (p.id === id ? { ...p, ...campoLocal } : p)) ?? null);
    const res = await fetch(`/api/admin/contenido/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(cambios),
    });
    if (!res.ok) {
      setError("No se pudo guardar ese cambio, probá de nuevo.");
      cargar();
    }
  }

  const cambiarEstado = (id: string, nuevoEstado: Estado) =>
    actualizar(id, { estado: nuevoEstado }, { estado: nuevoEstado });
  const guardarNota = (id: string, notas: string) =>
    actualizar(id, { notas: notas || null }, { notas: notas || null });
  const cambiarVoz = (id: string, voz: VozProvider) =>
    actualizar(id, { vozProvider: voz }, { voz_provider: voz });

  async function aprobarTanda(fecha: string) {
    const idsAAprobar = (piezas ?? []).filter((p) => p.tanda_fecha === fecha && p.estado === "borrador").map((p) => p.id);
    setPiezas((prev) => prev?.map((p) => (idsAAprobar.includes(p.id) ? { ...p, estado: "aprobada" } : p)) ?? null);
    await Promise.all(
      idsAAprobar.map((id) =>
        fetch(`/api/admin/contenido/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ estado: "aprobada" }),
        })
      )
    );
    cargar();
  }

  if (error && !piezas) return <p style={{ color: "#ff6666", fontSize: "0.85rem" }}>{error}</p>;
  if (!piezas) return <p style={{ color: "#888" }}>Cargando…</p>;

  const contador = (est: Estado) => piezas.filter((p) => p.estado === est).length;

  const visibles = piezas.filter((p) => {
    if (filtro === "revisar") return p.estado === "borrador";
    if (filtro === "todas") return true;
    return p.estado === filtro;
  });

  const fechas = [...new Set(visibles.map((p) => p.tanda_fecha))].sort((a, b) => (a < b ? 1 : -1));

  return (
    <div>
      <div className="form-header">
        <h1>Contenido</h1>
        <p>
          Lo que arma el motor de contenido cada semana (Instagram, TikTok, YouTube) — revisalo,
          comentá qué ajustar, y aprobá o descartá. Los comentarios los lee el guionista antes de
          armar la próxima tanda.
        </p>
      </div>

      <RoadmapStrip onIrARecomendaciones={onIrARecomendaciones} />

      {error && <p style={{ color: "#ff6666", fontSize: "0.85rem", marginBottom: 16 }}>{error}</p>}

      <div className="cnt-filters">
        {FILTROS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={filtro === f.key ? "btn-primary" : "btn-secondary"}
            style={{ padding: "6px 16px", fontSize: "0.85rem" }}
            onClick={() => setFiltro(f.key)}
          >
            {f.label}
            {f.key !== "todas" && ` (${contador(f.key === "revisar" ? "borrador" : f.key)})`}
          </button>
        ))}
      </div>

      {fechas.length === 0 && (
        <p style={{ color: "#666" }}>
          {filtro === "revisar" ? "No hay piezas esperando revisión. ✨" : "No hay piezas en este filtro."}
        </p>
      )}

      {fechas.map((fecha) => {
        const piezasSemana = visibles.filter((p) => p.tanda_fecha === fecha);
        const pendientesSemana = piezasSemana.filter((p) => p.estado === "borrador").length;
        return (
          <div key={fecha} className="cnt-week">
            <div className="cnt-week-header">
              <div>
                <div className="cnt-week-titulo">Tanda del {formatearFecha(fecha)}</div>
                <div className="cnt-week-meta">{piezasSemana.length} pieza{piezasSemana.length === 1 ? "" : "s"}</div>
              </div>
              {pendientesSemana > 1 && (
                <button type="button" className="cnt-btn aprobar" onClick={() => aprobarTanda(fecha)}>
                  Aprobar las {pendientesSemana} pendientes de esta tanda
                </button>
              )}
            </div>
            <div className="cnt-grid">
              {piezasSemana.map((p) => (
                <PiezaCard
                  key={p.id}
                  p={p}
                  elevenlabsDisponible={elevenlabsDisponible}
                  onCambiarEstado={cambiarEstado}
                  onGuardarNota={guardarNota}
                  onCambiarVoz={cambiarVoz}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
