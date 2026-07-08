"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ConsultasForm() {
  const params = useSearchParams();
  const servicio = params.get("servicio") ?? "";
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const nombre = fd.get("nombre") as string;
    const apellido = fd.get("apellido") as string;
    const email = fd.get("email") as string;
    const whatsapp = fd.get("whatsapp") as string;
    const mensaje = fd.get("mensaje") as string;
    const pais = (fd.get("pais") as string) || null;
    const ciudad = (fd.get("ciudad") as string) || null;

    if (supabase) {
      const { error } = await supabase.from("consultas").insert({
        servicio,
        nombre,
        apellido,
        email,
        whatsapp,
        mensaje,
        pais,
        ciudad,
      });
      if (error) {
        console.error("consultas insert failed:", error);
        setStatus("error");
        return;
      }
    }

    // El aviso por mail no debe bloquear la confirmación al usuario si falla
    // (la consulta ya quedó guardada, que es lo importante).
    fetch("/api/consultas/notificar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ servicio, nombre, apellido, email, whatsapp, mensaje, pais, ciudad }),
    }).catch((err) => console.error("aviso de consulta falló:", err));

    setStatus("sent");
  }

  if (status === "error") {
    return (
      <div className="form-plain">
        <div className="form-header">
          <h1>Hubo un problema</h1>
          <p>No pudimos enviar tu consulta. Probá de nuevo en un momento, o escribinos por WhatsApp.</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <button className="btn-primary" onClick={() => setStatus("idle")}>Volver a intentar</button>
        </div>
      </div>
    );
  }

  if (status === "sent") {
    return (
      <div className="form-plain">
        <div className="form-header">
          <h1>¡Gracias!</h1>
          <p>Recibí tu consulta. Te responderé lo antes posible.</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <Link href="/" className="btn-secondary">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="form-plain">
      <div className="form-header">
        <Link href="/" className="back">← Volver al inicio</Link>
        <h1>Consultas</h1>
        <p>Antes de comprar, preguntame lo que necesites</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="required">Servicio</label>
          <input type="text" readOnly value={servicio || "General"} style={{ opacity: 0.6, cursor: "not-allowed" }} />
        </div>

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
          <p className="hint">Con código de país</p>
        </div>

        <div className="form-group">
          <label className="required">Tu consulta</label>
          <textarea name="mensaje" placeholder="Escribí tu consulta aquí..." required />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>País (opcional)</label>
            <input type="text" name="pais" placeholder="Argentina" />
          </div>
          <div className="form-group">
            <label>Ciudad (opcional)</label>
            <input type="text" name="ciudad" placeholder="Ciudad" />
          </div>
        </div>

        <div className="checkbox-group">
          <label>
            <input type="checkbox" required />
            <span>Acepto que me contactes para responder mi consulta.</span>
          </label>
        </div>

        <button type="submit" className="btn-primary" style={{ width: "100%" }}>
          Enviar consulta
        </button>

        <div style={{ textAlign: "center", margin: "24px 0 48px" }}>
          <Link href="/" className="btn-secondary" style={{ display: "inline-block" }}>
            Volver al inicio
          </Link>
        </div>
      </form>
    </div>
  );
}
