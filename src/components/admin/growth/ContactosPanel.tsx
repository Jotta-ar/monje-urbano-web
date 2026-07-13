"use client";

import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";

type Etapa = "lead" | "consulto" | "comprador" | "recurrente";

interface Contacto {
  id: string;
  email: string;
  nombre: string | null;
  apellido: string | null;
  whatsapp: string | null;
  es_newsletter: boolean;
  tiene_consulta: boolean;
  compras_completadas: number;
  etapa: Etapa;
  ultima_interaccion_en: string;
}

interface Resumen {
  lead: number;
  consulto: number;
  comprador: number;
  recurrente: number;
}

const ETAPA_LABEL: Record<Etapa, string> = {
  lead: "Lead",
  consulto: "Consultó",
  comprador: "Comprador",
  recurrente: "Recurrente",
};

const FILTROS: { etapa: Etapa | "todos"; label: string }[] = [
  { etapa: "todos", label: "Todos" },
  { etapa: "lead", label: "Lead" },
  { etapa: "consulto", label: "Consultó" },
  { etapa: "comprador", label: "Comprador" },
  { etapa: "recurrente", label: "Recurrente" },
];

export default function ContactosPanel({ session }: { session: Session }) {
  const [contactos, setContactos] = useState<Contacto[] | null>(null);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<Etapa | "todos">("todos");
  const [busqueda, setBusqueda] = useState("");
  const token = session.access_token;

  useEffect(() => {
    async function cargar() {
      setError(null);
      try {
        const res = await fetch("/api/admin/contactos", { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setContactos(data.contactos);
        setResumen(data.resumen);
      } catch {
        setError("No se pudieron cargar los contactos.");
      }
    }
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibles = useMemo(() => {
    if (!contactos) return [];
    const q = busqueda.trim().toLowerCase();
    return contactos.filter((c) => {
      if (filtro !== "todos" && c.etapa !== filtro) return false;
      if (!q) return true;
      const nombreCompleto = `${c.nombre ?? ""} ${c.apellido ?? ""}`.toLowerCase();
      return c.email.toLowerCase().includes(q) || nombreCompleto.includes(q);
    });
  }, [contactos, filtro, busqueda]);

  if (error) return <p style={{ color: "#ff6666", fontSize: "0.85rem" }}>{error}</p>;
  if (!contactos || !resumen) return <p style={{ color: "#888" }}>Cargando…</p>;

  return (
    <div>
      <div className="form-header">
        <h1>Contactos</h1>
        <p>Todo el mundo que compró, consultó o se anotó al newsletter, en un solo lugar.</p>
      </div>

      <div className="stat-grid" style={{ marginBottom: 28 }}>
        <div className="stat-tile">
          <p className="stat-label">Lead</p>
          <p className="stat-value">{resumen.lead}</p>
        </div>
        <div className="stat-tile">
          <p className="stat-label">Consultó</p>
          <p className="stat-value">{resumen.consulto}</p>
        </div>
        <div className="stat-tile">
          <p className="stat-label">Comprador</p>
          <p className="stat-value">{resumen.comprador}</p>
        </div>
        <div className="stat-tile">
          <p className="stat-label">Recurrente</p>
          <p className="stat-value">{resumen.recurrente}</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {FILTROS.map((f) => (
            <button
              key={f.etapa}
              type="button"
              className={filtro === f.etapa ? "btn-primary" : "btn-secondary"}
              style={{ padding: "6px 18px", fontSize: "0.85rem" }}
              onClick={() => setFiltro(f.etapa)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Buscar por nombre o email…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ maxWidth: 280 }}
        />
      </div>

      {visibles.length === 0 ? (
        <p style={{ color: "#888" }}>No hay contactos que coincidan.</p>
      ) : (
        <div className="contactos-table-wrap">
          <table className="contactos-table">
            <thead>
              <tr>
                <th>Contacto</th>
                <th>WhatsApp</th>
                <th>Etapa</th>
                <th>Newsletter</th>
                <th>Compras</th>
                <th>Última interacción</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--fg)" }}>
                      {c.nombre || c.apellido ? `${c.nombre ?? ""} ${c.apellido ?? ""}`.trim() : "—"}
                    </div>
                    <div style={{ color: "var(--muted)" }}>{c.email}</div>
                  </td>
                  <td>{c.whatsapp || "—"}</td>
                  <td>
                    <span className="chip chip-etapa" data-etapa={c.etapa}>{ETAPA_LABEL[c.etapa]}</span>
                  </td>
                  <td>{c.es_newsletter ? "Sí" : "—"}</td>
                  <td className="num">{c.compras_completadas}</td>
                  <td>{new Date(c.ultima_interaccion_en).toLocaleDateString("es-AR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
