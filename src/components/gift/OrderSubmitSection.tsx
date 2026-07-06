"use client";

import { useState } from "react";
import { useGiftMode } from "./GiftModeContext";
import PaymentGatewayButtons from "@/components/PaymentGatewayButtons";
import { crearCompra, type Moneda } from "@/lib/compras";
import { formDataToObject } from "@/lib/formData";

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
  const [status, setStatus] = useState<"idle" | "enviando" | "listo" | "error">("idle");

  async function handlePagar(moneda: Moneda) {
    const form = getForm();
    if (!form) return;
    if (!form.reportValidity()) return;

    setStatus("enviando");
    const fd = new FormData(form);
    const datos = formDataToObject(fd);

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

      if (moneda !== "ARS") {
        // El pago en USD todavía no tiene pasarela conectada.
        setStatus("listo");
        return;
      }

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
