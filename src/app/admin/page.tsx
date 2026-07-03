"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

interface PrecioRow {
  id: string;
  label: string;
  monto_ars: number | null;
  monto_usd: number | null;
}

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [precios, setPrecios] = useState<PrecioRow[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabase || !session) return;
    supabase
      .from("precios")
      .select("id, label, monto_ars, monto_usd")
      .order("id")
      .then(({ data }) => setPrecios(data ?? []));
  }, [session]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError(error.message);
  }

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

  if (!supabase) {
    return (
      <div className="form-plain">
        <div className="form-header">
          <h1>Panel de administración</h1>
          <p>
            Todavía falta conectar el proyecto de Supabase (variables de entorno
            NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY). Una vez configurado, acá vas
            a poder loguearte y editar los precios.
          </p>
        </div>
      </div>
    );
  }

  if (loading) return <div className="form-plain" />;

  if (!session) {
    return (
      <div className="form-plain" style={{ maxWidth: 420 }}>
        <div className="form-header">
          <h1>Panel de administración</h1>
          <p>Ingresá con tu cuenta de administrador.</p>
        </div>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="required">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="required">Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {loginError && <p style={{ color: "#ff6666", fontSize: "0.85rem" }}>{loginError}</p>}
          <button type="submit" className="btn-primary" style={{ width: "100%" }}>Ingresar</button>
        </form>
      </div>
    );
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
