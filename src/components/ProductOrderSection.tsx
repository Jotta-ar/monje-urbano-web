"use client";

import { useState } from "react";
import PaymentGatewayButtons, { type Pasarela } from "@/components/PaymentGatewayButtons";
import TransferenciaInfo from "@/components/TransferenciaInfo";
import { crearCompra, type Moneda } from "@/lib/compras";

/**
 * Flujo de compra para productos físicos (Talismán, Porta Sahumerio): no
 * tiene modo regalo ni "contenido" personalizado como los servicios — solo
 * datos de contacto y envío, y el botón de pago. Se guarda todo en `datos`
 * para que quede a mano en el panel de admin al momento de despachar.
 */
export default function ProductOrderSection({ servicio }: { servicio: string }) {
  const [status, setStatus] = useState<"idle" | "enviando" | "listo" | "transferencia" | "error">("idle");
  const [transferencia, setTransferencia] = useState<{
    token: string;
    datosTransferencia: string | null;
    metodo: "banco" | "usdt";
  } | null>(null);

  async function handlePagar(moneda: Moneda, pasarela: Pasarela) {
    const form = document.getElementById(`form-${servicio}`) as HTMLFormElement | null;
    if (!form) return;
    if (!form.reportValidity()) return;

    setStatus("enviando");
    const fd = new FormData(form);
    const datos = Object.fromEntries(fd.entries()) as Record<string, string>;

    try {
      const { id, error } = await crearCompra({
        servicio,
        esRegalo: false,
        datos,
        compradorNombre: datos["nombre"],
        compradorApellido: datos["apellido"],
        compradorEmail: datos["email"],
        compradorWhatsapp: datos["whatsapp"],
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

      // pasarela === "transferencia" | "usdt"
      const metodo = pasarela === "usdt" ? "usdt" : "banco";
      const resp = await fetch("/api/transferencia/crear-pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ compraId: id, metodo }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        console.error("crear-pedido transferencia failed:", data.error);
        setStatus("error");
        return;
      }
      setTransferencia({ token: data.token, datosTransferencia: data.datosTransferencia, metodo });
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
        metodo={transferencia.metodo}
      />
    );
  }

  if (status === "listo") {
    return (
      <div className="purchase-section">
        <p style={{ color: "#eee", fontSize: "1rem" }}>
          ¡Gracias por tu confianza! En cuanto se confirme el pago, me pongo en marcha con tu pedido.
        </p>
      </div>
    );
  }

  return (
    <form id={`form-${servicio}`} onSubmit={(e) => e.preventDefault()}>
      <div className="form-row">
        <div className="form-group">
          <label className="required">Nombre</label>
          <input type="text" name="nombre" placeholder="Nombre" required />
        </div>
        <div className="form-group">
          <label className="required">Apellido</label>
          <input type="text" name="apellido" placeholder="Apellido" required />
        </div>
      </div>

      <div className="form-group">
        <label className="required">Email</label>
        <input type="email" name="email" placeholder="tu@email.com" required />
      </div>

      <div className="form-group">
        <label className="required">WhatsApp</label>
        <input type="tel" name="whatsapp" placeholder="+54 9 11 ..." required />
        <p className="hint">Con código de país — te vamos a avisar por acá cuando esté listo para entrega o envío</p>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="required">País</label>
          <input type="text" name="pais" placeholder="Argentina" required />
        </div>
        <div className="form-group">
          <label className="required">Ciudad</label>
          <input type="text" name="ciudad" placeholder="Ciudad" required />
        </div>
      </div>

      <div className="form-group">
        <label className="required">Dirección de entrega</label>
        <input type="text" name="direccion" placeholder="Calle, número, piso/depto" required />
      </div>

      <div className="purchase-section">
        <p>Todo listo. Elegí cómo pagar para confirmar tu pedido.</p>
        <PaymentGatewayButtons onPagar={handlePagar} />
        {status === "enviando" && (
          <p style={{ fontSize: "0.8rem", color: "#666", marginTop: 10 }}>Procesando…</p>
        )}
      </div>
    </form>
  );
}
