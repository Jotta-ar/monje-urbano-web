"use client";

import { useEffect, useState } from "react";
import type { Moneda } from "@/lib/compras";

export type Pasarela = "mercadopago" | "paypal" | "transferencia" | "usdt";

/**
 * Currency/gateway picker: ARS -> Mercado Pago (un solo botón "Pagar"), USD
 * -> PayPal, transferencia bancaria o USDT (el cliente elige). La moneda la
 * decide sola la página según el país detectado por IP en middleware.ts
 * (guardado en la cookie "moneda") — no se muestra ningún selector de
 * moneda, cada visitante ve directo las opciones que le corresponden.
 */
export default function PaymentGatewayButtons({
  onPagar,
}: {
  onPagar: (moneda: Moneda, pasarela: Pasarela) => void;
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

  if (moneda === "ARS") {
    return (
      <div>
        <button type="button" className="btn-primary" onClick={() => onPagar("ARS", "mercadopago")}>
          Pagar
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <button type="button" className="btn-primary" onClick={() => onPagar("USD", "paypal")}>
        Pagar con PayPal
      </button>
      <button type="button" className="btn-outline" onClick={() => onPagar("USD", "transferencia")}>
        Transferencia bancaria
      </button>
      <button type="button" className="btn-outline" onClick={() => onPagar("USD", "usdt")}>
        Pagar con USDT
      </button>
    </div>
  );
}
