"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

interface Reporte {
  id: string;
  titulo: string;
  contenido: string;
  cantidad_recomendaciones: number;
  creado_en: string;
}

export default function ReportesPanel({ session }: { session: Session }) {
  const [reportes, setReportes] = useState<Reporte[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const token = session.access_token;

  useEffect(() => {
    async function cargar() {
      setError(null);
      try {
        const res = await fetch("/api/admin/reportes", { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error();
        const { reportes } = await res.json();
        setReportes(reportes);
        if (reportes.length > 0) setSeleccionado(reportes[0].id);
      } catch {
        setError("No se pudieron cargar los reportes.");
      }
    }
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) return <p style={{ color: "#ff6666", fontSize: "0.85rem" }}>{error}</p>;
  if (!reportes) return <p style={{ color: "#888" }}>Cargando…</p>;

  const activo = reportes.find((r) => r.id === seleccionado) ?? null;

  return (
    <div>
      <div className="form-header">
        <h1>Reportes</h1>
        <p>Lo que fue encontrando el agente asesor en cada corrida semanal.</p>
      </div>

      {reportes.length === 0 ? (
        <p style={{ color: "#888" }}>Todavía no hay reportes — van a empezar a aparecer acá cada vez que corra el agente.</p>
      ) : (
        <div className="reportes-layout">
          <div className="reportes-lista">
            {reportes.map((r) => (
              <button
                key={r.id}
                type="button"
                className={`reportes-lista-item${r.id === seleccionado ? " activo" : ""}`}
                onClick={() => setSeleccionado(r.id)}
              >
                <p className="titulo">{r.titulo}</p>
                <p className="meta">
                  {new Date(r.creado_en).toLocaleDateString("es-AR")} · {r.cantidad_recomendaciones} recomendaciones
                </p>
              </button>
            ))}
          </div>

          <div className="reportes-detalle">
            {activo ? (
              <>
                <h3>{activo.titulo}</h3>
                <p className="meta">
                  {new Date(activo.creado_en).toLocaleString("es-AR")} · {activo.cantidad_recomendaciones} recomendaciones agregadas
                </p>
                <p className="contenido">{activo.contenido}</p>
              </>
            ) : (
              <p style={{ color: "#888" }}>Elegí un reporte de la lista.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
