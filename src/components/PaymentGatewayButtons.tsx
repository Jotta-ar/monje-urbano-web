"use client";

import { useEffect, useState } from "react";
import type { Moneda } from "@/lib/compras";

const MP_CONFIGURED = !!process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
const STRIPE_CONFIGURED = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

/**
 * Currency/gateway picker: ARS -> Mercado Pago, USD -> Stripe.
 * Pre-selecciona según el país detectado por IP en middleware.ts (guardado
 * en la cookie "moneda"), pero siempre deja el toggle visible y editable
 * porque la detección por IP puede fallar (VPN, roaming, etc).
 */
export default function PaymentGatewayButtons({
  onPagar,
}: {
  onPagar: (moneda: Moneda) => void;
}) {
  const [moneda, setMoneda] = useState<Moneda>("ARS");

  useEffect(() => {
    const cookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("moneda="))
      ?.split("=")[1];
    setMoneda(cookie === "USD" ? "USD" : "ARS");
  }, []);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 14 }}>
        <button
          type="button"
          className={moneda === "ARS" ? "btn-outline" : "btn-secondary"}
          style={moneda === "ARS" ? { background: "rgba(255,255,255,0.12)" } : undefined}
          onClick={() => setMoneda("ARS")}
        >
          Pesos (Argentina)
        </button>
        <button
          type="button"
          className={moneda === "USD" ? "btn-outline" : "btn-secondary"}
          style={moneda === "USD" ? { background: "rgba(255,255,255,0.12)" } : undefined}
          onClick={() => setMoneda("USD")}
        >
          Dólares (Exterior)
        </button>
      </div>

      <button type="button" className="btn-primary" onClick={() => onPagar(moneda)}>
        {moneda === "ARS" ? "Pagar con Mercado Pago" : "Pagar con Stripe (USD)"}
      </button>

      {((moneda === "ARS" && !MP_CONFIGURED) || (moneda === "USD" && !STRIPE_CONFIGURED)) && (
        <p style={{ fontSize: "0.75rem", color: "#666", marginTop: 10, fontFamily: "Inter, sans-serif" }}>
          Pasarela en modo de prueba: falta configurar las credenciales reales.
        </p>
      )}
    </div>
  );
}
