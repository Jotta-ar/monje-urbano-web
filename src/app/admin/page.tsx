"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminGate from "@/components/admin/AdminGate";

interface PrecioRow {
  id: string;
  label: string;
  monto_ars: number | null;
  monto_usd: number | null;
}

export default function AdminPage() {
  return <AdminGate>{() => <PreciosPanel />}</AdminGate>;
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
    <div className="form-plain" style={{ maxWidth: 720 }}>
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
