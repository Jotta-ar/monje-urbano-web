"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formDataToObject } from "@/lib/formData";
import PersonalDataFields from "@/components/forms/PersonalDataFields";
import ComoSupisteField from "@/components/forms/ComoSupisteField";
import ManifiestoFields from "@/components/forms/ManifiestoFields";
import MagiaSanadoraFields from "@/components/forms/MagiaSanadoraFields";
import CartografiaFields from "@/components/forms/CartografiaFields";
import RitualMatutinoFields from "@/components/forms/RitualMatutinoFields";

const SERVICIO_INFO: Record<string, { titulo: string; Fields: React.ComponentType }> = {
  manifiesto: { titulo: "Manifiesto Personalizado", Fields: ManifiestoFields },
  magia_sanadora: { titulo: "Magia Sanadora", Fields: MagiaSanadoraFields },
  cartografia: { titulo: "Cartografía del Síntoma", Fields: CartografiaFields },
  ritual_matutino: { titulo: "Ritual Matutino Personalizado", Fields: RitualMatutinoFields },
};

const MENSAJE_CONFIRMACION: Record<string, string> = {
  magia_sanadora:
    "Tu pedido de Magia Sanadora fue recibido. Voy a revisar tu intención y coordinar con vos el inicio de las sesiones.",
  manifiesto:
    "Tu pedido de Manifiesto Personalizado fue recibido. Voy a revisar tu historia y los datos compartidos para comenzar el proceso.",
  ritual_matutino:
    "Tu pedido de Ritual Matutino fue recibido. Voy a revisar tu momento actual para preparar una práctica simple, concreta y posible.",
  cartografia:
    "Tu pedido de Cartografía del Síntoma fue recibido. Voy a revisar lo que compartiste para trabajar la lectura simbólica y el ritual correspondiente.",
};

type Compra = { servicio: string; estado: string; destinatario_email: string | null };

export default function CompletarRegaloPage() {
  const { token } = useParams<{ token: string }>();
  const [compra, setCompra] = useState<Compra | null | undefined>(undefined);
  const [status, setStatus] = useState<"idle" | "enviado" | "error">("idle");

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/gift/${token}`);
      if (!res.ok) {
        setCompra(null);
        return;
      }
      const { compra } = await res.json();
      setCompra(compra as Compra);
    }
    load();
  }, [token]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = formDataToObject(new FormData(e.currentTarget));
    const res = await fetch(`/api/gift/${token}/completar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    if (!res.ok) {
      console.error("completar regalo update failed:", await res.text());
      setStatus("error");
      return;
    }
    setStatus("enviado");
  }

  if (compra === undefined) {
    return <div className="form-plain"><p style={{ textAlign: "center", color: "#888" }}>Cargando…</p></div>;
  }

  if (!compra) {
    return (
      <div className="form-plain">
        <div className="form-header">
          <h1>Link no encontrado</h1>
          <p>Este link de regalo no es válido, o el sitio todavía no tiene la base de datos conectada.</p>
        </div>
        <div style={{ textAlign: "center" }}><Link href="/" className="btn-secondary">Volver al inicio</Link></div>
      </div>
    );
  }

  if (compra.estado === "pendiente_pago") {
    return (
      <div className="form-plain">
        <div className="form-header">
          <h1>Todavía estamos confirmando el pago</h1>
          <p>En cuanto se acredite, este link se habilita automáticamente. Volvé a intentarlo en unos minutos.</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="form-plain">
        <div className="form-header">
          <h1>Hubo un problema</h1>
          <p>No pudimos guardar tu formulario. Probá de nuevo en un momento.</p>
        </div>
      </div>
    );
  }

  if (status === "enviado" || compra.estado === "completado") {
    return (
      <div className="form-plain">
        <div className="form-header">
          <h1>¡Gracias por confiar!</h1>
          <p>Tu pedido fue recibido.</p>
        </div>
        <p style={{ textAlign: "center", color: "#ccc", maxWidth: 480, margin: "0 auto 20px" }}>
          {MENSAJE_CONFIRMACION[compra.servicio]}
        </p>
        <p style={{ textAlign: "center", color: "#999", maxWidth: 480, margin: "0 auto 28px" }}>
          Me voy a comunicar con vos por WhatsApp o correo para confirmar los detalles y coordinar
          el inicio del proceso.
        </p>
        <p style={{ textAlign: "center", fontFamily: "var(--font-pirata-one)", color: "#eee", fontSize: "1.1rem" }}>
          Silencio, presencia y propósito.
        </p>
      </div>
    );
  }

  const info = SERVICIO_INFO[compra.servicio];
  if (!info) return null;
  const { titulo, Fields } = info;

  return (
    <div className="form-plain">
      <div className="form-header">
        <h1>¡Te regalaron {titulo}!</h1>
        <p>Ya está pago — solo completá tus datos para que empecemos.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Tu información</h2>
          <PersonalDataFields />
          <Fields />
          <ComoSupisteField />
        </div>

        <div className="purchase-section">
          <p>No necesitás pagar nada: ya fue abonado por quien te lo regaló.</p>
          <button type="submit" className="btn-primary">Enviar mi formulario</button>
        </div>
      </form>
    </div>
  );
}
