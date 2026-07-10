"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import TransferenciaInfo from "@/components/TransferenciaInfo";

export default function TransferenciaTokenPage() {
  const params = useParams();
  const token = params.token as string;
  const [estado, setEstado] = useState<"cargando" | "listo" | "error">("cargando");
  const [datos, setDatos] = useState<{
    datosTransferencia: string | null;
    tieneComprobante: boolean;
    pagado: boolean;
    metodo: "banco" | "usdt";
  } | null>(null);

  useEffect(() => {
    fetch(`/api/transferencia/${token}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setDatos({
          datosTransferencia: d.datosTransferencia,
          tieneComprobante: d.tieneComprobante,
          pagado: d.estado !== "pendiente_pago",
          metodo: d.metodo === "usdt" ? "usdt" : "banco",
        });
        setEstado("listo");
      })
      .catch(() => setEstado("error"));
  }, [token]);

  if (estado === "cargando") {
    return (
      <div className="form-plain">
        <p style={{ color: "#888", textAlign: "center" }}>Cargando…</p>
      </div>
    );
  }

  if (estado === "error" || !datos) {
    return (
      <div className="form-plain">
        <div className="form-header">
          <h1>No encontramos este pedido</h1>
          <p>El link puede estar mal copiado o el pedido ya no está disponible.</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <Link href="/" className="btn-secondary">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="form-plain">
      <div className="form-header">
        <h1>Tu transferencia</h1>
        <p>{datos.pagado ? "Ya confirmamos tu pago, gracias." : "Acá tenés los datos para completar el pago."}</p>
      </div>
      {!datos.pagado && (
        <TransferenciaInfo
          datosTransferencia={datos.datosTransferencia}
          token={token}
          metodo={datos.metodo}
          tieneComprobanteInicial={datos.tieneComprobante}
        />
      )}
      <div style={{ textAlign: "center", margin: "24px 0 48px" }}>
        <Link href="/" className="btn-secondary">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
