import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Testimonio {
  id: string;
  nombre: string | null;
  apellido: string | null;
  privacidad: string;
  frase: string;
  valoracion: number;
}

function nombreVisible(t: Testimonio) {
  switch (t.privacidad) {
    case "nombre_completo":
      return [t.nombre, t.apellido].filter(Boolean).join(" ") || "Anónimo";
    case "solo_nombre":
      return t.nombre || "Anónimo";
    case "seudonimo":
      return t.nombre || "Seudónimo";
    default:
      return "Anónimo";
  }
}

export default async function TestimonialTeaser({ servicio }: { servicio: string }) {
  let testimonios: Testimonio[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("testimonios")
      .select("id, nombre, apellido, privacidad, frase, valoracion")
      .eq("publicado", true)
      .contains("servicios", [servicio])
      .order("creado_en", { ascending: false })
      .limit(4);
    testimonios = data ?? [];
  }

  if (testimonios.length === 0) return null;

  return (
    <div className="reveal" style={{ marginTop: 56 }}>
      <h3>Semillas del Camino</h3>
      <div className="faq-grid" style={{ marginTop: 20 }}>
        {testimonios.map((t) => (
          <div className="faq-item" key={t.id}>
            <strong>{"★".repeat(t.valoracion)}{"☆".repeat(5 - t.valoracion)} — {nombreVisible(t)}</strong>
            <span>&quot;{t.frase}&quot;</span>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: 24 }}>
        <Link href="/semillas-del-camino" className="btn-secondary">Ver todas las Semillas del Camino</Link>
      </div>
    </div>
  );
}
