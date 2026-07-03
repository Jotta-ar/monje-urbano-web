"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { formDataToObject } from "@/lib/formData";
import PersonalDataFields from "@/components/forms/PersonalDataFields";

const PDF_URL = "/docs/manifiesto-monje-urbano-libre.pdf";

export default function DescargarManifiestoPage() {
  const [status, setStatus] = useState<"idle" | "listo">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = formDataToObject(new FormData(e.currentTarget));

    if (supabase) {
      // La descarga es gratuita y no debe bloquearse por un fallo de guardado;
      // igual dejamos el error en consola para poder detectarlo y corregirlo.
      const { error } = await supabase.from("compras").insert({
        servicio: "manifiesto_descarga_gratuita",
        es_regalo: false,
        estado: "completado",
        comprador_nombre: datos["nombre"],
        comprador_apellido: datos["apellido"],
        comprador_email: datos["email"],
        comprador_whatsapp: datos["whatsapp"],
        datos,
        moneda: "ARS",
        monto: 0,
        pagado_en: new Date().toISOString(),
        completado_en: new Date().toISOString(),
      });
      if (error) console.error("registro de descarga del manifiesto falló:", error);
    }

    setStatus("listo");
    const a = document.createElement("a");
    a.href = PDF_URL;
    a.download = "Manifiesto-Monje-Urbano-Libre.pdf";
    a.click();
  }

  if (status === "listo") {
    return (
      <div className="form-plain">
        <div className="form-header">
          <h1>¡Gracias!</h1>
          <p>Tu descarga debería empezar sola. Si no pasó nada, tocá el botón de abajo.</p>
        </div>
        <div style={{ textAlign: "center", display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href={PDF_URL} download className="btn-primary">Descargar el Manifiesto en PDF</a>
          <Link href="/#manifiesto" className="btn-secondary">Volver al Manifiesto</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="form-plain">
      <div className="form-header">
        <Link href="/#manifiesto" className="back">← Volver al inicio</Link>
        <h1>Descargar el Manifiesto</h1>
        <p>Completá tus datos y descargalo al instante, sin costo.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <PersonalDataFields />
        <button type="submit" className="btn-primary" style={{ width: "100%" }}>
          Descargar PDF
        </button>
      </form>
    </div>
  );
}
