"use client";

import { useState } from "react";

const STORAGE_KEY = "mul_datos_personales";

type Datos = {
  nombre: string;
  apellido: string;
  email: string;
  whatsapp: string;
  pais: string;
  ciudad: string;
  edad: string;
  genero: string;
};

const VACIO: Datos = {
  nombre: "",
  apellido: "",
  email: "",
  whatsapp: "",
  pais: "",
  ciudad: "",
  edad: "",
  genero: "",
};

function leerGuardado(): Datos {
  if (typeof window === "undefined") return VACIO;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return VACIO;
    return { ...VACIO, ...JSON.parse(raw) };
  } catch {
    return VACIO;
  }
}

function guardar(datos: Datos) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
  } catch {
    // localStorage no disponible (modo privado, etc.) — no pasa nada, solo no se recuerda.
  }
}

/**
 * Precarga los datos personales desde el último formulario completado en este
 * mismo navegador, para que quien ya compró o descargó algo antes no tenga que
 * volver a tipear todo de cero. Los datos quedan solo en el dispositivo del
 * usuario (localStorage), no se comparten entre dispositivos.
 */
export default function PersonalDataFields() {
  const [datos, setDatos] = useState<Datos>(leerGuardado);

  function actualizar<K extends keyof Datos>(campo: K, valor: string) {
    const next = { ...datos, [campo]: valor };
    setDatos(next);
    guardar(next);
  }

  return (
    <>
      <div className="form-row">
        <div className="form-group">
          <label className="required">Nombre</label>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            required
            value={datos.nombre}
            onChange={(e) => actualizar("nombre", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="required">Apellido</label>
          <input
            type="text"
            name="apellido"
            placeholder="Apellido"
            required
            value={datos.apellido}
            onChange={(e) => actualizar("apellido", e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="required">Email</label>
        <input
          type="email"
          name="email"
          placeholder="tu@email.com"
          required
          value={datos.email}
          onChange={(e) => actualizar("email", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="required">WhatsApp</label>
        <input
          type="tel"
          name="whatsapp"
          placeholder="+54 9 11 ..."
          required
          value={datos.whatsapp}
          onChange={(e) => actualizar("whatsapp", e.target.value)}
        />
        <p className="hint">Con código de país</p>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="required">País</label>
          <input
            type="text"
            name="pais"
            placeholder="Argentina"
            required
            value={datos.pais}
            onChange={(e) => actualizar("pais", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="required">Ciudad</label>
          <input
            type="text"
            name="ciudad"
            placeholder="Ciudad"
            required
            value={datos.ciudad}
            onChange={(e) => actualizar("ciudad", e.target.value)}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="required">Edad</label>
          <input
            type="number"
            name="edad"
            placeholder="34"
            min={1}
            required
            value={datos.edad}
            onChange={(e) => actualizar("edad", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="required">Género</label>
          <select
            name="genero"
            required
            value={datos.genero}
            onChange={(e) => actualizar("genero", e.target.value)}
          >
            <option value="" disabled>Elegí una opción</option>
            <option>Femenino</option>
            <option>Masculino</option>
            <option>Otro</option>
          </select>
        </div>
      </div>
    </>
  );
}
