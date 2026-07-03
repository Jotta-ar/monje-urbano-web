"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const nombre = (form.elements.namedItem("nombre") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;

    if (supabase) {
      const { error } = await supabase.from("newsletter_subscribers").insert({ nombre, email });
      if (error) {
        console.error("newsletter insert failed:", error);
        setStatus("error");
        return;
      }
    }
    setStatus("sent");
    form.reset();
  }

  if (status === "sent") {
    return <p style={{ color: "#ccc" }}>¡Gracias por suscribirte!</p>;
  }

  if (status === "error") {
    return (
      <p style={{ color: "#e88" }}>
        No pudimos guardar tu suscripción.{" "}
        <button className="btn-secondary" style={{ padding: "4px 14px" }} onClick={() => setStatus("idle")}>
          Reintentar
        </button>
      </p>
    );
  }

  return (
    <form
      className="form-plain"
      style={{ padding: 0, display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", maxWidth: 520, margin: "0 auto" }}
      onSubmit={handleSubmit}
    >
      <input type="text" name="nombre" placeholder="Nombre" required style={{ flex: "1 1 160px" }} />
      <input type="email" name="email" placeholder="tu@email.com" required style={{ flex: "1 1 220px" }} />
      <button type="submit" className="btn-primary" style={{ flex: "1 1 100%" }}>Suscribirme ahora</button>
    </form>
  );
}
