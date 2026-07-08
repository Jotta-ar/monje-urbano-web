"use client";

import { useEffect, useState } from "react";
import type { Moneda } from "@/lib/compras";

const MP_CONFIGURED = !!process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
const STRIPE_CONFIGURED = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

/**
 * Currency/gateway picker: ARS -> Mercado Pago, USD -> Stripe.
 * La moneda la decide sola la página según el país detectado por IP en
 * middleware.ts (guardado en la cookie "moneda") — no se muestra ningún
 * selector, cada visitante ve directo el botón que le corresponde.
 */
export default function PaymentGatewayButtons({
  onPagar,
}: {
  onPagar: (moneda: Moneda) => void;
}) {
  const [moneda, setMoneda] = useState<Moneda | null>(null);

  useEffect(() => {
    const cookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("moneda="))
      ?.split("=")[1];
    setMoneda(cookie === "USD" ? "USD" : "ARS");
  }, []);

  // Evita el parpadeo de mostrar el botón equivocado un instante antes de
  // leer la cookie en el efecto de arriba.
  if (!moneda) return null;

  return (
    <div>
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
