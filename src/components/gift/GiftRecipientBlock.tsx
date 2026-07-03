"use client";

import { useGiftMode } from "./GiftModeContext";

export default function GiftRecipientBlock() {
  const { mode } = useGiftMode();
  if (mode !== "regalar") return null;

  return (
    <div className="gift-email-wrap open">
      <div className="gift-email-inner">
        <label className="required">Tu email (para la confirmación de pago)</label>
        <input type="email" name="comprador_email" placeholder="tu@email.com" required />

        <label className="required" style={{ marginTop: 14 }}>
          Email de quien recibe el regalo
        </label>
        <input
          type="email"
          name="destinatario_email"
          placeholder="email@de-quien-recibe.com"
          required
        />
        <p className="gift-hint">
          Después de pagar, le vamos a enviar a esa dirección un link para que complete
          su formulario sin tener que pagar nada.
        </p>
      </div>
    </div>
  );
}
