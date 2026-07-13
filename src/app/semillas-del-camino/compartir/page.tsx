"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { formDataToObject } from "@/lib/formData";
import { subirArchivo } from "@/lib/storage";

const SERVICIOS = [
  "Magia Sanadora",
  "Manifiesto Personalizado",
  "Cartografía del Síntoma",
  "Ritual Matutino Personalizado",
  "Talismán del Monje Urbano Libre",
  "Porta Sahumerio Invertido",
  "Otro",
];

const VALORACION_OPTS = [
  { value: "5", label: "★★★★★" },
  { value: "4", label: "★★★★☆" },
  { value: "3", label: "★★★☆☆" },
  { value: "2", label: "★★☆☆☆" },
  { value: "1", label: "★☆☆☆☆" },
];

const PRIVACIDAD_OPTS = [
  { value: "nombre_completo", label: "Sí, con mi nombre y apellido." },
  { value: "solo_nombre", label: "Sí, solo con mi nombre." },
  { value: "seudonimo", label: "Sí, con un seudónimo." },
  { value: "anonimo", label: "Sí, de forma completamente anónima." },
  { value: "privado", label: "Prefiero que permanezca privada." },
];

export default function CompartirExperienciaPage() {
  const [privacidad, setPrivacidad] = useState("");
  const [status, setStatus] = useState<"idle" | "enviado" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.getAll("servicios").length === 0) {
      alert("Elegí al menos una opción en \"¿Con qué viviste esta experiencia?\".");
      return;
    }
    const datos = formDataToObject(fd);
    const foto = fd.get("foto");
    const fotoUrl = foto instanceof File ? await subirArchivo(foto, "testimonios") : null;

    if (supabase) {
      const { error } = await supabase.from("testimonios").insert({
        servicios: Array.isArray(datos.servicios) ? datos.servicios : [datos.servicios].filter(Boolean),
        nombre: datos.nombre,
        apellido: datos.apellido,
        email: datos.email,
        pais: datos.pais,
        ciudad: datos.ciudad,
        antes: datos.antes,
        proceso: datos.proceso,
        hoy: datos.hoy,
        frase: datos.frase,
        valoracion: Number(datos.valoracion),
        privacidad: datos.privacidad,
        foto_url: fotoUrl,
        mejora_interna: datos.mejora || null,
        autorizado: datos.privacidad !== "privado",
        publicado: false,
      });
      if (error) {
        console.error("testimonio insert failed:", error);
        setStatus("error");
        return;
      }
    }
    setStatus("enviado");
  }

  if (status === "error") {
    return (
      <div className="form-plain">
        <div className="form-header">
          <h1>Hubo un problema</h1>
          <p>No pudimos guardar tu experiencia. Probá de nuevo en un momento.</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <button className="btn-primary" onClick={() => setStatus("idle")}>Volver a intentar</button>
        </div>
      </div>
    );
  }

  if (status === "enviado") {
    return (
      <div className="form-plain">
        <div className="form-header">
          <h1>¡Gracias por compartir tu experiencia!</h1>
          <p>
            Tu semilla fue recibida. La leeré con atención y, si autorizaste su publicación, podrá
            formar parte de Semillas del Camino respetando la privacidad que elegiste.
          </p>
        </div>
        <div style={{ textAlign: "center" }}>
          <Link href="/semillas-del-camino" className="btn-secondary">Ver Semillas del Camino</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="form-plain">
      <div className="form-header">
        <Link href="/semillas-del-camino" className="back">← Volver a Semillas del Camino</Link>
        <h1>Compartí tu experiencia</h1>
        <p>
          No buscamos opiniones perfectas. Buscamos experiencias reales. Lo que viviste puede
          convertirse en la semilla que alguien necesita para comenzar su propio camino.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Datos personales</h2>
          <div className="form-row">
            <div className="form-group">
              <label className="required">Nombre</label>
              <input type="text" name="nombre" required />
            </div>
            <div className="form-group">
              <label className="required">Apellido</label>
              <input type="text" name="apellido" required />
            </div>
          </div>
          <div className="form-group">
            <label className="required">Email</label>
            <input type="email" name="email" required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="required">País</label>
              <input type="text" name="pais" required />
            </div>
            <div className="form-group">
              <label className="required">Ciudad</label>
              <input type="text" name="ciudad" required />
            </div>
          </div>

          <div className="form-group">
            <label className="required">¿Con qué viviste esta experiencia? (elegí al menos una)</label>
            <div className="checkbox-group">
              {SERVICIOS.map((s) => (
                <label key={s}>
                  <input type="checkbox" name="servicios" value={s} />
                  <span>{s}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="required">Antes de comenzar... ¿cómo te encontrabas?</label>
            <textarea name="antes" required />
          </div>

          <div className="form-group">
            <label className="required">El camino: ¿qué ocurrió durante el proceso?</label>
            <textarea name="proceso" required />
          </div>

          <div className="form-group">
            <label className="required">Hoy: ¿qué cambió en vos o en tu vida?</label>
            <textarea name="hoy" required />
          </div>

          <div className="form-group">
            <label className="required">Si tuvieras que resumirlo en una frase...</label>
            <input type="text" name="frase" required />
            <p className="hint">Esta frase podrá utilizarse como destacado en la página web.</p>
          </div>

          <div className="form-group">
            <label className="required">¿Cómo fue tu experiencia?</label>
            <div className="radio-group">
              {VALORACION_OPTS.map((opt) => (
                <label key={opt.value}>
                  <input type="radio" name="valoracion" value={opt.value} required />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="required">¿Podemos compartir tu experiencia?</label>
            <div className="radio-group">
              {PRIVACIDAD_OPTS.map((opt) => (
                <label key={opt.value}>
                  <input
                    type="radio"
                    name="privacidad"
                    value={opt.value}
                    required
                    onChange={() => setPrivacidad(opt.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Fotografía (opcional)</label>
            <input type="file" name="foto" accept="image/jpeg,image/png" />
            <p className="hint">
              Puede ser una imagen tuya, del producto, de tu altar, del lugar donde realizaste el
              ritual o cualquier imagen que represente tu experiencia.
            </p>
          </div>

          <div className="form-group">
            <label>¿Hay algo que podríamos mejorar? (opcional, uso interno — no se publica)</label>
            <textarea name="mejora" />
          </div>

          {privacidad !== "privado" && (
            <div className="checkbox-group">
              <label>
                <input type="checkbox" required />
                <span className="checkbox-legal">
                  Autorizo al Monje Urbano Libre a publicar mi experiencia respetando la opción de
                  privacidad que elegí.
                </span>
              </label>
            </div>
          )}
        </div>

        <button type="submit" className="btn-primary" style={{ width: "100%" }}>
          Compartir mi experiencia
        </button>
      </form>
    </div>
  );
}
