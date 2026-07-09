"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

const ASUNTOS = ["Consulta", "Comentario", "Colaboración", "Otro"];

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [faltaAsunto, setFaltaAsunto] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const nombre = (form.elements.namedItem("nombre") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const asunto = ASUNTOS.filter(
      (a) => (form.elements.namedItem(`asunto-${a}`) as HTMLInputElement)?.checked
    ).join(", ");
    const mensaje = (form.elements.namedItem("mensaje") as HTMLTextAreaElement).value;

    if (!asunto) {
      setFaltaAsunto(true);
      return;
    }
    setFaltaAsunto(false);

    if (supabase) {
      const { error } = await supabase.from("consultas").insert({
        servicio: asunto,
        nombre,
        apellido: "",
        email,
        whatsapp: "",
        mensaje,
      });
      if (error) {
        console.error("contacto insert failed:", error);
        setStatus("error");
        return;
      }
    }

    // El aviso por mail no debe bloquear la confirmación al usuario si falla
    // (la consulta ya quedó guardada, que es lo importante).
    fetch("/api/consultas/notificar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ servicio: asunto, nombre, email, mensaje }),
    }).catch((err) => console.error("aviso de consulta falló:", err));

    setStatus("sent");
    form.reset();
  }

  if (status === "sent") {
    return <p style={{ color: "#ccc" }}>Mensaje enviado. Gracias por escribir.</p>;
  }

  if (status === "error") {
    return (
      <p style={{ color: "#e88" }}>
        No pudimos enviar tu mensaje.{" "}
        <button className="btn-secondary" style={{ padding: "4px 14px" }} onClick={() => setStatus("idle")}>
          Reintentar
        </button>
      </p>
    );
  }

  return (
    <form className="form-plain" style={{ padding: 0 }} onSubmit={handleSubmit}>
      <div className="form-group"><input type="text" name="nombre" placeholder="Nombre completo" required /></div>
      <div className="form-group"><input type="email" name="email" placeholder="Email" required /></div>
      <div className="form-group">
        <label>Asunto de tu mensaje</label>
        <div className="checkbox-group">
          {ASUNTOS.map((a) => (
            <label key={a}>
              <input type="checkbox" name={`asunto-${a}`} />
              <span>{a}</span>
            </label>
          ))}
        </div>
        {faltaAsunto && (
          <p className="hint" style={{ color: "#e88" }}>Elegí al menos un asunto.</p>
        )}
      </div>
      <div className="form-group"><textarea name="mensaje" placeholder="Tu mensaje" required /></div>
      <button type="submit" className="btn-primary">Enviar mensaje</button>
    </form>
  );
}
