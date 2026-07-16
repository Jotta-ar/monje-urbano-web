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

const COLUMNAS: { estado: Estado; titulo: string }[] = [
  { estado: "borrador", titulo: "Borrador" },
  { estado: "aprobada", titulo: "Aprobada" },
  { estado: "publicada", titulo: "Publicada" },
  { estado: "descartada", titulo: "Descartada" },
];

const EJE_LABEL: Record<Eje, string> = {
  elevarse: "Elevarse",
  centrarse: "Centrarse",
  enraizarse: "Enraizarse",
};
const EJE_FAMILIA: Record<Eje, string> = {
  elevarse: "conversion", // reusa los colores ya definidos para los chips de área
  centrarse: "relacion",
  enraizarse: "base",
};

const TIPO_LABEL: Record<Tipo, string> = {
  nucleo: "Reels / TikTok / Shorts",
  youtube_largo: "YouTube largo",
};

function accionesPara(estado: Estado): { label: string; nuevoEstado: Estado }[] {
  switch (estado) {
    case "borrador":
      return [
        { label: "Aprobar", nuevoEstado: "aprobada" },
        { label: "Descartar", nuevoEstado: "descartada" },
      ];
    case "aprobada":
      return [
        { label: "Marcar publicada", nuevoEstado: "publicada" },
        { label: "Volver a borrador", nuevoEstado: "borrador" },
      ];
    case "publicada":
    case "descartada":
      return [{ label: "Reabrir a borrador", nuevoEstado: "borrador" }];
  }
}

function NotaCard({ p, onGuardarNota }: { p: Pieza; onGuardarNota: (id: string, notas: string) => void }) {
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
            className="reco-btn"
            onClick={() => {
              onGuardarNota(p.id, borrador.trim());
              setEditando(false);
            }}
          >
            Guardar comentario
          </button>
          <button type="button" className="reco-btn" onClick={() => { setBorrador(p.notas ?? ""); setEditando(false); }}>
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {p.notas && (
        <p style={{ fontStyle: "italic", borderLeft: "2px solid var(--border)", paddingLeft: 10 }}>{p.notas}</p>
      )}
      <button type="button" className="reco-btn" onClick={() => setEditando(true)} style={{ alignSelf: "flex-start" }}>
        {p.notas ? "Editar comentario" : "Comentar"}
      </button>
    </>
  );
}

function PiezaCard({
  p,
  colapsable,
  elevenlabsDisponible,
  onCambiarEstado,
  onGuardarNota,
  onCambiarVoz,
}: {
  p: Pieza;
  colapsable: boolean;
  elevenlabsDisponible: boolean;
  onCambiarEstado: (id: string, nuevoEstado: Estado) => void;
  onGuardarNota: (id: string, notas: string) => void;
  onCambiarVoz: (id: string, voz: VozProvider) => void;
}) {
  const [expandido, setExpandido] = useState(!colapsable);
  const hook = p.lineas.find((l) => l.estilo === "hook")?.texto ?? p.titulo ?? "(sin hook)";

  return (
    <div className="reco-card">
      <div className="reco-card-top">
        <span className="chip chip-area">{TIPO_LABEL[p.tipo]}</span>
        {p.cruce_eje && (
          <span className={`chip chip-area familia-${EJE_FAMILIA[p.cruce_eje]}`}>{EJE_LABEL[p.cruce_eje]}</span>
        )}
        {p.es_cta_directo && <span className="chip chip-prioridad" data-prioridad="alta">CTA directo</span>}
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
      <h4>{hook}</h4>
      <p style={{ fontSize: "0.75rem", color: "#777", margin: "0 0 8px" }}>
        Tanda del {new Date(p.tanda_fecha + "T00:00:00").toLocaleDateString("es-AR")}
        {p.cruce_principio ? ` · ${p.cruce_principio}` : ""}
      </p>

      {expandido && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
            {p.lineas.map((l, i) => (
              <p key={i} style={{ margin: 0, fontStyle: l.estilo === "cierre" ? "italic" : "normal" }}>
                {l.texto}
              </p>
            ))}
          </div>

          {p.puente_venta && (
            <p style={{ fontSize: "0.8rem", color: "#999", margin: "0 0 10px" }}>
              Puente de venta: {p.puente_venta}
            </p>
          )}

          <div className="form-group" style={{ marginBottom: 10 }}>
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

          {p.video_url && (
            <video controls src={p.video_url} style={{ width: "100%", maxWidth: 280, borderRadius: 6, marginBottom: 10 }} />
          )}

          <NotaCard p={p} onGuardarNota={onGuardarNota} />

          <div className="reco-card-actions">
            {accionesPara(p.estado).map((accion) => (
              <button
                key={accion.label}
                type="button"
                className="reco-btn"
                onClick={() => onCambiarEstado(p.id, accion.nuevoEstado)}
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

export default function ContenidoPanel({ session }: { session: Session }) {
  const [piezas, setPiezas] = useState<Pieza[] | null>(null);
  const [elevenlabsDisponible, setElevenlabsDisponible] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  if (error && !piezas) return <p style={{ color: "#ff6666", fontSize: "0.85rem" }}>{error}</p>;
  if (!piezas) return <p style={{ color: "#888" }}>Cargando…</p>;

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

      {error && <p style={{ color: "#ff6666", fontSize: "0.85rem", marginBottom: 16 }}>{error}</p>}

      <div className="reco-board">
        {COLUMNAS.map((col) => {
          const items = piezas
            .filter((p) => p.estado === col.estado)
            .sort((a, b) => (a.tanda_fecha < b.tanda_fecha ? 1 : -1));
          return (
            <div key={col.estado}>
              <div className="reco-column-header">
                <span>{col.titulo}</span>
                <span>{items.length}</span>
              </div>
              <div className="reco-column-list">
                {items.length === 0 && <p style={{ color: "#666", fontSize: "0.8rem" }}>—</p>}
                {items.map((p) => (
                  <PiezaCard
                    key={p.id}
                    p={p}
                    colapsable={col.estado === "publicada" || col.estado === "descartada"}
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
    </div>
  );
}
