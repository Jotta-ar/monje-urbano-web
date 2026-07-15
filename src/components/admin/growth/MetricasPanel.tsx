"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

interface Metricas {
  ventas: {
    mesActual: Record<string, number>;
    mesAnterior: Record<string, number>;
  };
  pedidosPorEstado: Record<string, number>;
  topComoSupiste: { fuente: string; cantidad: number }[];
  consultasSinResponder: number;
  transferenciasSinComprobante: number;
  pedidosAbandonados: number;
}

interface PuntoRed {
  seguidores: number | null;
  publicaciones: number | null;
  metricaExtra: Record<string, unknown> | null;
  capturadoEn: string;
}

interface Redes {
  historico: Record<string, PuntoRed[]>;
}

function formatoMoneda(monto: number, moneda: string) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: moneda, maximumFractionDigits: 0 }).format(monto);
}

function Sparkline({ valores }: { valores: number[] }) {
  const puntos = valores.filter((v): v is number => v !== null && v !== undefined);
  if (puntos.length < 2) return null;

  const min = Math.min(...puntos);
  const max = Math.max(...puntos);
  const rango = max - min || 1;
  const anchoTotal = 120;
  const alto = 28;

  const coords = puntos.map((v, i) => {
    const x = (i / (puntos.length - 1)) * anchoTotal;
    const y = alto - ((v - min) / rango) * alto;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const ultimo = coords[coords.length - 1].split(",");

  return (
    <svg className="sparkline" viewBox={`0 0 ${anchoTotal} ${alto}`} preserveAspectRatio="none" aria-hidden="true">
      <polyline points={coords.join(" ")} fill="none" stroke="var(--moon-yellow)" strokeWidth="1.5" />
      <circle cx={ultimo[0]} cy={ultimo[1]} r="2" fill="var(--moon-yellow)" />
    </svg>
  );
}

function Delta({ actual, anterior }: { actual: number; anterior: number }) {
  if (anterior === 0) return <p className="stat-sub">Sin datos del mes anterior</p>;
  const cambio = ((actual - anterior) / anterior) * 100;
  const positivo = cambio >= 0;
  return (
    <p className={`stat-delta ${positivo ? "up" : "down"}`}>
      {positivo ? "▲" : "▼"} {Math.abs(cambio).toFixed(0)}% vs. mes anterior
    </p>
  );
}

export default function MetricasPanel({ session }: { session: Session }) {
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [redes, setRedes] = useState<Redes | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [avisoTikTok, setAvisoTikTok] = useState<"conectado" | "error" | null>(null);
  const [avisoInstagram, setAvisoInstagram] = useState<"conectado" | "error" | null>(null);
  const token = session.access_token;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resultadoTikTok = params.get("tiktok");
    const resultadoInstagram = params.get("instagram");
    let cambio = false;
    if (resultadoTikTok === "conectado" || resultadoTikTok === "error") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAvisoTikTok(resultadoTikTok);
      params.delete("tiktok");
      cambio = true;
    }
    if (resultadoInstagram === "conectado" || resultadoInstagram === "error") {
      setAvisoInstagram(resultadoInstagram);
      params.delete("instagram");
      cambio = true;
    }
    if (cambio) {
      const query = params.toString();
      window.history.replaceState({}, "", window.location.pathname + (query ? `?${query}` : ""));
    }
  }, []);

  useEffect(() => {
    async function cargar() {
      setError(null);
      const [resMetricas, resRedes] = await Promise.all([
        fetch("/api/admin/metricas", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/redes", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (!resMetricas.ok || !resRedes.ok) {
        setError("No se pudieron cargar las métricas.");
        return;
      }
      setMetricas(await resMetricas.json());
      setRedes(await resRedes.json());
    }
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) return <p style={{ color: "#ff6666", fontSize: "0.85rem" }}>{error}</p>;
  if (!metricas || !redes) return <p style={{ color: "#888" }}>Cargando…</p>;

  const youtube = redes.historico.youtube ?? [];
  const ultimoYoutube = youtube[youtube.length - 1];
  const tiktok = redes.historico.tiktok ?? [];
  const ultimoTikTok = tiktok[tiktok.length - 1];
  const instagram = redes.historico.instagram ?? [];
  const ultimoInstagram = instagram[instagram.length - 1];

  return (
    <div>
      <div className="form-header">
        <h1>Métricas</h1>
        <p>Ventas, pedidos y redes — actualizado en cada visita al panel.</p>
      </div>

      {avisoTikTok === "conectado" && (
        <p style={{ color: "var(--ok)", fontSize: "0.9rem", marginBottom: 20 }}>TikTok conectado correctamente ✓</p>
      )}
      {avisoTikTok === "error" && (
        <p style={{ color: "var(--danger)", fontSize: "0.9rem", marginBottom: 20 }}>
          No se pudo conectar TikTok, probá de nuevo.
        </p>
      )}
      {avisoInstagram === "conectado" && (
        <p style={{ color: "var(--ok)", fontSize: "0.9rem", marginBottom: 20 }}>Instagram conectado correctamente ✓</p>
      )}
      {avisoInstagram === "error" && (
        <p style={{ color: "var(--danger)", fontSize: "0.9rem", marginBottom: 20 }}>
          No se pudo conectar Instagram, probá de nuevo.
        </p>
      )}

      <h3 style={{ fontSize: "1rem", color: "#ccc", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 14px" }}>
        Ventas
      </h3>
      <div className="stat-grid" style={{ marginBottom: 32 }}>
        <div className="stat-tile">
          <p className="stat-label">Ventas del mes — ARS</p>
          <p className="stat-value">{formatoMoneda(metricas.ventas.mesActual.ARS ?? 0, "ARS")}</p>
          <Delta actual={metricas.ventas.mesActual.ARS ?? 0} anterior={metricas.ventas.mesAnterior.ARS ?? 0} />
        </div>
        <div className="stat-tile">
          <p className="stat-label">Ventas del mes — USD</p>
          <p className="stat-value">{formatoMoneda(metricas.ventas.mesActual.USD ?? 0, "USD")}</p>
          <Delta actual={metricas.ventas.mesActual.USD ?? 0} anterior={metricas.ventas.mesAnterior.USD ?? 0} />
        </div>
        <div className="stat-tile">
          <p className="stat-label">Pedidos pendientes de pago</p>
          <p className="stat-value">{metricas.pedidosPorEstado.pendiente_pago ?? 0}</p>
        </div>
        <div className="stat-tile">
          <p className="stat-label">Pedidos abandonados (+48h)</p>
          <p className="stat-value" style={{ color: metricas.pedidosAbandonados > 0 ? "var(--warn)" : undefined }}>
            {metricas.pedidosAbandonados}
          </p>
        </div>
        <div className="stat-tile">
          <p className="stat-label">Transferencias sin comprobante</p>
          <p className="stat-value" style={{ color: metricas.transferenciasSinComprobante > 0 ? "var(--warn)" : undefined }}>
            {metricas.transferenciasSinComprobante}
          </p>
        </div>
        <div className="stat-tile">
          <p className="stat-label">Consultas sin responder</p>
          <p className="stat-value" style={{ color: metricas.consultasSinResponder > 0 ? "var(--danger)" : undefined }}>
            {metricas.consultasSinResponder}
          </p>
        </div>
        <div className="stat-tile">
          <p className="stat-label">Cómo te encuentran</p>
          {metricas.topComoSupiste.length === 0 ? (
            <p className="stat-sub">Sin datos todavía</p>
          ) : (
            metricas.topComoSupiste.map((f) => (
              <p key={f.fuente} className="stat-sub" style={{ margin: "2px 0" }}>
                {f.fuente} — {f.cantidad}
              </p>
            ))
          )}
        </div>
      </div>

      <h3 style={{ fontSize: "1rem", color: "#ccc", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 14px" }}>
        Redes
      </h3>
      <div className="stat-grid">
        <div className="stat-tile">
          <p className="stat-label">YouTube — suscriptores</p>
          {ultimoYoutube ? (
            <>
              <p className="stat-value">{ultimoYoutube.seguidores}</p>
              <p className="stat-sub">{ultimoYoutube.publicaciones} videos</p>
              <Sparkline valores={youtube.map((p) => p.seguidores ?? 0)} />
            </>
          ) : (
            <p className="stat-sub">Sin datos todavía — se carga solo cada lunes.</p>
          )}
        </div>
        <div className={`stat-tile${ultimoInstagram ? "" : " is-muted"}`}>
          <p className="stat-label">Instagram</p>
          {ultimoInstagram ? (
            <>
              <p className="stat-value">{ultimoInstagram.seguidores}</p>
              <p className="stat-sub">{ultimoInstagram.publicaciones} publicaciones</p>
              <Sparkline valores={instagram.map((p) => p.seguidores ?? 0)} />
            </>
          ) : (
            <>
              <p className="stat-value" style={{ fontSize: "1.1rem" }}>Sin conectar</p>
              <a href={`/api/admin/redes/instagram/conectar?token=${token}`} className="stat-sub" style={{ textDecoration: "underline" }}>
                Conectar Instagram →
              </a>
            </>
          )}
        </div>
        <div className={`stat-tile${ultimoTikTok ? "" : " is-muted"}`}>
          <p className="stat-label">TikTok</p>
          {ultimoTikTok ? (
            <>
              <p className="stat-value">{ultimoTikTok.seguidores}</p>
              <p className="stat-sub">{ultimoTikTok.publicaciones} videos</p>
              <Sparkline valores={tiktok.map((p) => p.seguidores ?? 0)} />
            </>
          ) : (
            <>
              <p className="stat-value" style={{ fontSize: "1.1rem" }}>Sin conectar</p>
              <a href={`/api/admin/redes/tiktok/conectar?token=${token}`} className="stat-sub" style={{ textDecoration: "underline" }}>
                Conectar TikTok →
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
