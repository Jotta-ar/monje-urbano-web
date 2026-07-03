"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
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

type Compra = { servicio: string; estado: string; destinatario_email: string | null };

export default function CompletarRegaloPage() {
  const { token } = useParams<{ token: string }>();
  const [compra, setCompra] = useState<Compra | null | undefined>(undefined);
  const [status, setStatus] = useState<"idle" | "enviado" | "error">("idle");

  useEffect(() => {
    async function load() {
      if (!supabase) {
        setCompra(null);
        return;
      }
      const { data } = await supabase
        .from("compras")
        .select("servicio, estado, destinatario_email")
        .eq("token", token)
        .maybeSingle();
      setCompra((data as Compra) ?? null);
    }
    load();
  }, [token]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) return;
    const datos = formDataToObject(new FormData(e.currentTarget));
    const { error } = await supabase
      .from("compras")
      .update({ datos, estado: "completado", completado_en: new Date().toISOString() })
      .eq("token", token);
    if (error) {
      console.error("completar regalo update failed:", error);
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
          <h1>¡Gracias por compartir tu momento!</h1>
          <p>Tu semilla fue recibida. Ya me pongo en marcha con tu pedido.</p>
        </div>
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
