"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

type Area = "ADS" | "VTA" | "PAG" | "ONB" | "EML" | "CRM" | "SUP" | "DOC" | "CNT" | "REP" | "SEG";
type Prioridad = "alta" | "media" | "baja";
type Estado = "pendiente" | "en_progreso" | "hecho" | "descartada";
type Origen = "diagnostico" | "agente" | "manual";

interface Recomendacion {
  id: string;
  area: Area;
  titulo: string;
  descripcion: string | null;
  prioridad: Prioridad;
  estado: Estado;
  origen: Origen;
  creado_en: string;
}

const AREAS: Area[] = ["ADS", "VTA", "PAG", "ONB", "EML", "CRM", "SUP", "DOC", "CNT", "REP", "SEG"];
const PRIORIDADES: Prioridad[] = ["alta", "media", "baja"];

const FAMILIA: Record<Area, string> = {
  ADS: "captacion", CNT: "captacion",
  VTA: "conversion", PAG: "conversion", ONB: "conversion",
  EML: "relacion", CRM: "relacion", SEG: "relacion", SUP: "relacion",
  DOC: "base", REP: "base",
};

const ORDEN_PRIORIDAD: Record<Prioridad, number> = { alta: 0, media: 1, baja: 2 };

const COLUMNAS: { estado: Estado; titulo: string }[] = [
  { estado: "pendiente", titulo: "Pendiente" },
  { estado: "en_progreso", titulo: "En curso" },
  { estado: "hecho", titulo: "Hecho" },
  { estado: "descartada", titulo: "Descartada" },
];

const ORIGEN_LABEL: Record<Origen, string> = {
  diagnostico: "diagnóstico",
  agente: "agente",
  manual: "manual",
};

const LARGO_MAX_DESCRIPCION = 160;

function DescripcionCard({ texto }: { texto: string }) {
  const [expandido, setExpandido] = useState(false);
  const esLarga = texto.length > LARGO_MAX_DESCRIPCION;
  const mostrado = expandido || !esLarga ? texto : texto.slice(0, LARGO_MAX_DESCRIPCION).trimEnd() + "…";

  return (
    <>
      <p>{mostrado}</p>
      {esLarga && (
        <button type="button" className="reco-btn ver-mas" onClick={() => setExpandido((v) => !v)}>
          {expandido ? "Ver menos" : "Ver más"}
        </button>
      )}
    </>
  );
}

function RecoCard({
  r,
  colapsable,
  onCambiarEstado,
}: {
  r: Recomendacion;
  colapsable: boolean;
  onCambiarEstado: (id: string, nuevoEstado: Estado) => void;
}) {
  const [expandido, setExpandido] = useState(!colapsable);

  return (
    <div className="reco-card">
      <div className="reco-card-top">
        <span className={`chip chip-area familia-${FAMILIA[r.area]}`}>{r.area}</span>
        <span className="chip chip-prioridad" data-prioridad={r.prioridad}>{r.prioridad}</span>
        <span className="chip chip-origen">{ORIGEN_LABEL[r.origen]}</span>
        {colapsable && (
          <button
            type="button"
            className="reco-btn ver-mas"
            style={{ marginLeft: "auto" }}
            onClick={() => setExpandido((v) => !v)}
            aria-label={expandido ? "Colapsar" : "Expandir"}
          >
            {expandido ? "▲" : "▼"}
          </button>
        )}
      </div>
      <h4>{r.titulo}</h4>
      {expandido && (
        <>
          {r.descripcion && <DescripcionCard texto={r.descripcion} />}
          <div className="reco-card-actions">
            {accionesPara(r.estado).map((accion) => (
              <button
                key={accion.label}
                type="button"
                className="reco-btn"
                onClick={() => onCambiarEstado(r.id, accion.nuevoEstado)}
              >
                {accion.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function accionesPara(estado: Estado): { label: string; nuevoEstado: Estado }[] {
  switch (estado) {
    case "pendiente":
      return [
        { label: "Empezar", nuevoEstado: "en_progreso" },
        { label: "Descartar", nuevoEstado: "descartada" },
      ];
    case "en_progreso":
      return [
        { label: "Marcar hecho", nuevoEstado: "hecho" },
        { label: "Volver a pendiente", nuevoEstado: "pendiente" },
      ];
    case "hecho":
    case "descartada":
      return [{ label: "Reabrir", nuevoEstado: "pendiente" }];
  }
}

export default function RecomendacionesPanel({ session }: { session: Session }) {
  const [recos, setRecos] = useState<Recomendacion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const token = session.access_token;

  async function cargar() {
    setError(null);
    try {
      const res = await fetch("/api/admin/recomendaciones", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      const { recomendaciones } = await res.json();
      setRecos(recomendaciones);
    } catch {
      setError("No se pudieron cargar las recomendaciones.");
    }
  }

  useEffect(() => {
    async function cargarInicial() {
      await cargar();
    }
    cargarInicial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function cambiarEstado(id: string, nuevoEstado: Estado) {
    setRecos((prev) => prev?.map((r) => (r.id === id ? { ...r, estado: nuevoEstado } : r)) ?? null);
    const res = await fetch(`/api/admin/recomendaciones/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    if (!res.ok) {
      setError("No se pudo actualizar esa recomendación, probá de nuevo.");
      cargar();
    }
  }

  if (error && !recos) return <p style={{ color: "#ff6666", fontSize: "0.85rem" }}>{error}</p>;
  if (!recos) return <p style={{ color: "#888" }}>Cargando…</p>;

  return (
    <div>
      <div className="form-header">
        <h1>Recomendaciones</h1>
        <p>Lo que falta automatizar o mejorar, agrupado por estado. Movelas a medida que avanzás.</p>
      </div>

      {error && <p style={{ color: "#ff6666", fontSize: "0.85rem", marginBottom: 16 }}>{error}</p>}

      <button type="button" className="btn-secondary" style={{ marginBottom: 20 }} onClick={() => setMostrarForm((v) => !v)}>
        {mostrarForm ? "Cancelar" : "+ Agregar recomendación"}
      </button>

      {mostrarForm && (
        <AgregarForm
          token={token}
          onCreada={(nueva) => {
            setRecos((prev) => [nueva, ...(prev ?? [])]);
            setMostrarForm(false);
          }}
        />
      )}

      <div className="reco-board">
        {COLUMNAS.map((col) => {
          const items = recos
            .filter((r) => r.estado === col.estado)
            .sort((a, b) => ORDEN_PRIORIDAD[a.prioridad] - ORDEN_PRIORIDAD[b.prioridad]);
          return (
            <div key={col.estado}>
              <div className="reco-column-header">
                <span>{col.titulo}</span>
                <span>{items.length}</span>
              </div>
              <div className="reco-column-list">
                {items.length === 0 && <p style={{ color: "#666", fontSize: "0.8rem" }}>—</p>}
                {items.map((r) => (
                  <RecoCard
                    key={r.id}
                    r={r}
                    colapsable={col.estado === "hecho" || col.estado === "descartada"}
                    onCambiarEstado={cambiarEstado}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AgregarForm({
  token,
  onCreada,
}: {
  token: string;
  onCreada: (r: Recomendacion) => void;
}) {
  const [area, setArea] = useState<Area | null>(null);
  const [prioridad, setPrioridad] = useState<Prioridad>("media");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!area || !titulo.trim()) {
      setError("Elegí un área y escribí un título.");
      return;
    }
    setEnviando(true);
    setError(null);
    const res = await fetch("/api/admin/recomendaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ area, titulo, descripcion: descripcion || null, prioridad }),
    });
    setEnviando(false);
    if (!res.ok) {
      setError("No se pudo guardar, probá de nuevo.");
      return;
    }
    const { recomendacion } = await res.json();
    onCreada(recomendacion);
  }

  return (
    <form onSubmit={handleSubmit} className="form-section" style={{ marginBottom: 28 }}>
      <div className="form-group">
        <label className="required">Área</label>
        <div
          className="radio-group"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: "4px 12px", marginTop: 4 }}
        >
          {AREAS.map((a) => (
            <label key={a} style={{ cursor: "pointer" }}>
              <input type="radio" name="reco-area" checked={area === a} onChange={() => setArea(a)} />
              <span>{a}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="required">Título</label>
        <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej: Armar recordatorio de comprobante de transferencia" />
      </div>

      <div className="form-group">
        <label>Descripción (opcional)</label>
        <textarea rows={3} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
      </div>

      <div className="form-group">
        <label>Prioridad</label>
        <div className="radio-group" style={{ display: "flex", gap: 16, marginTop: 4 }}>
          {PRIORIDADES.map((p) => (
            <label key={p} style={{ cursor: "pointer" }}>
              <input type="radio" name="reco-prioridad" checked={prioridad === p} onChange={() => setPrioridad(p)} />
              <span>{p}</span>
            </label>
          ))}
        </div>
      </div>

      {error && <p style={{ color: "#e88", marginBottom: 10 }}>{error}</p>}
      <button type="submit" className="btn-primary" disabled={enviando}>
        {enviando ? "Guardando…" : "Agregar"}
      </button>
    </form>
  );
}
