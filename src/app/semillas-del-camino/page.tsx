import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Testimonio {
  id: string;
  servicios: string[];
  nombre: string | null;
  apellido: string | null;
  ciudad: string | null;
  privacidad: string;
  frase: string;
  hoy: string;
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

export default async function SemillasDelCaminoPage() {
  let testimonios: Testimonio[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("testimonios")
      .select("id, servicios, nombre, apellido, ciudad, privacidad, frase, hoy, valoracion")
      .eq("publicado", true)
      .order("creado_en", { ascending: false });
    testimonios = data ?? [];
  }

  return (
    <div className="form-plain" style={{ maxWidth: 960 }}>
      <div className="form-header">
        <Link href="/" className="back">← Volver al inicio</Link>
        <h1>Semillas del Camino</h1>
        <p>
          Personas comunes. Historias reales. Transformaciones que comenzaron con un solo paso.
        </p>
      </div>

      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <Link href="/semillas-del-camino/compartir" className="btn-primary">
          Compartir mi experiencia
        </Link>
      </div>

      {testimonios.length === 0 ? (
        <p style={{ textAlign: "center", color: "#666" }}>
          Todavía no hay semillas publicadas. ¡Sé la primera persona en compartir tu experiencia!
        </p>
      ) : (
        <div className="faq-grid">
          {testimonios.map((t) => (
            <div className="faq-item" key={t.id}>
              <strong>
                {"★".repeat(t.valoracion)}
                {"☆".repeat(5 - t.valoracion)} — {nombreVisible(t)}
                {t.ciudad ? `, ${t.ciudad}` : ""}
              </strong>
              <span style={{ display: "block", marginBottom: 6, fontStyle: "italic" }}>
                &quot;{t.frase}&quot;
              </span>
              <span>{t.hoy}</span>
              <span style={{ display: "block", marginTop: 8, color: "#555" }}>
                {t.servicios.join(" · ")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
