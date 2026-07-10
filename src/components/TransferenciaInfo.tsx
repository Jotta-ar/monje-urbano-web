"use client";

import { useState } from "react";
import { subirArchivo } from "@/lib/storage";

/**
 * Se muestra tanto justo después de elegir "transferencia bancaria" en un
 * pedido, como en /transferencia/[token] si el cliente vuelve más tarde a
 * subir el comprobante. El link de vuelta usa el mismo `token` que ya trae
 * cada compra (reutilizado del flujo de regalo).
 */
export default function TransferenciaInfo({
  datosTransferencia,
  token,
  tieneComprobanteInicial = false,
}: {
  datosTransferencia: string | null;
  token: string;
  tieneComprobanteInicial?: boolean;
}) {
  const [subiendo, setSubiendo] = useState(false);
  const [subido, setSubido] = useState(tieneComprobanteInicial);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendo(true);
    setError(null);
    const path = await subirArchivo(file, "compras/transferencia");
    if (!path) {
      setError("No pudimos subir el archivo, probá de nuevo.");
      setSubiendo(false);
      return;
    }
    try {
      const resp = await fetch(`/api/transferencia/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comprobanteUrl: path }),
      });
      if (!resp.ok) {
        setError("No pudimos guardar el comprobante, probá de nuevo.");
        setSubiendo(false);
        return;
      }
      setSubido(true);
    } catch {
      setError("No pudimos guardar el comprobante, probá de nuevo.");
    }
    setSubiendo(false);
  }

  const link = typeof window !== "undefined" ? `${window.location.origin}/transferencia/${token}` : "";

  return (
    <div className="purchase-section">
      <h3 style={{ marginTop: 0 }}>Datos para la transferencia</h3>
      {datosTransferencia ? (
        <p style={{ whiteSpace: "pre-wrap", color: "#eee" }}>{datosTransferencia}</p>
      ) : (
        <p style={{ color: "#ccc" }}>
          Todavía estamos configurando la cuenta bancaria en EEUU — te vamos a escribir por
          WhatsApp o mail con los datos para que completes la transferencia.
        </p>
      )}

      {subido ? (
        <p style={{ color: "#8f8", marginTop: 16 }}>✓ Comprobante recibido, gracias.</p>
      ) : (
        <div style={{ marginTop: 16 }}>
          <label className="hint" style={{ display: "block", marginBottom: 6 }}>
            Subí una foto o captura del comprobante (podés hacerlo ahora o más tarde)
          </label>
          <input type="file" accept="image/*" onChange={handleFile} disabled={subiendo} />
          {subiendo && <p className="hint">Subiendo…</p>}
          {error && <p style={{ color: "#e88" }}>{error}</p>}
        </div>
      )}

      <p style={{ fontSize: "0.8rem", color: "#888", marginTop: 20 }}>
        Guardá este link para volver más tarde y subir el comprobante:
        <br />
        <span style={{ color: "#ccc" }}>{link}</span>
      </p>
    </div>
  );
}
