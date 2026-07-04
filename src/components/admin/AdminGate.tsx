"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

/**
 * Shared login gate for every /admin/* page. Renders children only once
 * there's a real Supabase Auth session, passing that session down so pages
 * can read the access token (needed to call the /api/admin/* routes, which
 * verify it server-side before touching the service_role client).
 */
export default function AdminGate({
  children,
}: {
  children: (session: Session) => React.ReactNode;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

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

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError(error.message);
  }

  if (!supabase) {
    return (
      <div className="form-plain">
        <div className="form-header">
          <h1>Panel de administración</h1>
          <p>
            Todavía falta conectar el proyecto de Supabase (variables de entorno
            NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).
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
    <>
      <div style={{ display: "flex", gap: 16, marginBottom: 24, fontSize: "0.85rem" }}>
        <Link href="/admin" className="btn-secondary" style={{ padding: "6px 18px" }}>Precios</Link>
        <Link href="/admin/pedidos" className="btn-secondary" style={{ padding: "6px 18px" }}>Pedidos</Link>
      </div>
      {children(session)}
    </>
  );
}
