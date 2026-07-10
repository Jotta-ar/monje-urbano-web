"use client";

import { useState } from "react";
import { useGiftMode } from "./GiftModeContext";
import PaymentGatewayButtons, { type Pasarela } from "@/components/PaymentGatewayButtons";
import TransferenciaInfo from "@/components/TransferenciaInfo";
import { crearCompra, type Moneda } from "@/lib/compras";
import { formDataToObjectConArchivos } from "@/lib/formData";

export default function OrderSubmitSection({
  servicio,
  getForm,
  modalidadField,
}: {
  servicio: string;
  /** Returns the closest <form> ancestor so we can read its FormData on "pagar". */
  getForm: () => HTMLFormElement | null;
  /** Name of the field that holds the chosen modalidad/serie, if any. */
  modalidadField?: string;
}) {
  const { mode } = useGiftMode();
  const [status, setStatus] = useState<"idle" | "enviando" | "listo" | "transferencia" | "error">("idle");
  const [transferencia, setTransferencia] = useState<{ token: string; datosTransferencia: string | null } | null>(
    null
  );

  async function handlePagar(moneda: Moneda, pasarela: Pasarela) {
    const form = getForm();
    if (!form) return;
    if (!form.reportValidity()) return;

    setStatus("enviando");
    const fd = new FormData(form);
    const datos = await formDataToObjectConArchivos(fd, `compras/${servicio}`);

    try {
      const { id, error } = await crearCompra({
        servicio,
        modalidad: modalidadField ? (datos[modalidadField] as string) : undefined,
        esRegalo: mode === "regalar",
        datos: mode === "vos" ? datos : undefined,
        compradorNombre: mode === "vos" ? (datos["nombre"] as string) : undefined,
        compradorApellido: mode === "vos" ? (datos["apellido"] as string) : undefined,
        compradorEmail: (mode === "vos" ? datos["email"] : datos["comprador_email"]) as string,
        compradorWhatsapp: mode === "vos" ? (datos["whatsapp"] as string) : undefined,
        destinatarioEmail: mode === "regalar" ? (datos["destinatario_email"] as string) : undefined,
        comoSupiste: datos["como_supiste"] as string | undefined,
        moneda,
      });

      if (error || !id) {
        setStatus("error");
        return;
      }

      if (pasarela === "mercadopago") {
        const resp = await fetch("/api/mercadopago/crear-preferencia", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ compraId: id }),
        });
        const data = await resp.json();
        if (!resp.ok || !data.initPoint) {
          console.error("crear-preferencia failed:", data.error);
          setStatus("error");
          return;
        }
        window.location.href = data.initPoint;
        return;
      }

      if (pasarela === "paypal") {
        const resp = await fetch("/api/paypal/crear-orden", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ compraId: id }),
        });
        const data = await resp.json();
        if (!resp.ok || !data.initPoint) {
          console.error("crear-orden PayPal failed:", data.error);
          setStatus("error");
          return;
        }
        window.location.href = data.initPoint;
        return;
      }

      // pasarela === "transferencia"
      const resp = await fetch("/api/transferencia/crear-pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ compraId: id }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        console.error("crear-pedido transferencia failed:", data.error);
        setStatus("error");
        return;
      }
      setTransferencia({ token: data.token, datosTransferencia: data.datosTransferencia });
      setStatus("transferencia");
    } catch (err) {
      console.error("handlePagar failed:", err);
      setStatus("error");
    }
  }

  if (status === "error") {
    return (
      <div className="purchase-section">
        <p style={{ color: "#e88" }}>
          No pudimos registrar tu pedido. Probá de nuevo en un momento, o escribinos por WhatsApp
          si el problema sigue.
        </p>
        <button className="btn-secondary" onClick={() => setStatus("idle")}>Volver a intentar</button>
      </div>
    );
  }

  if (status === "transferencia" && transferencia) {
    return (
      <TransferenciaInfo
        datosTransferencia={transferencia.datosTransferencia}
        token={transferencia.token}
      />
    );
  }

  if (status === "listo") {
    return (
      <div className="purchase-section">
        <p style={{ color: "#eee", fontSize: "1rem" }}>
          {mode === "regalar"
            ? "¡Gracias! En cuanto se confirme el pago, le vamos a enviar a quien recibe el regalo un link para completar su formulario sin costo."
            : "¡Gracias por tu confianza! En cuanto se confirme el pago, me pongo en marcha con tu pedido."}
        </p>
      </div>
    );
  }

  return (
    <div className="purchase-section">
      <p>
        {mode === "regalar"
          ? "Elegí cómo pagar el regalo. Después le enviamos el link a quien lo recibe."
          : "Todo listo. Elegí cómo pagar para confirmar tu pedido."}
      </p>
      <PaymentGatewayButtons onPagar={handlePagar} />
      {status === "enviando" && (
        <p style={{ fontSize: "0.8rem", color: "#666", marginTop: 10 }}>Procesando…</p>
      )}
    </div>
  );
}
