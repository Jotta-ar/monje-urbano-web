"use client";

import { useGiftMode } from "@/components/gift/GiftModeContext";

const SERIES = [
  { value: "unica", label: "Única (1 ritual)" },
  { value: "serie3", label: "Serie 3" },
  { value: "serie6", label: "Serie 6" },
  { value: "serie9", label: "Serie 9" },
  { value: "intensivo", label: "Quiero consultar tratamiento intensivo diario" },
];

/**
 * La serie de Magia Sanadora determina el precio a cobrar, así que tiene que
 * quedar habilitada y elegirse SIEMPRE al pagar — incluso en modo "Para
 * regalar", donde el resto del formulario queda bloqueado porque lo completa
 * quien recibe el regalo más adelante. Por eso vive afuera de ContentFields
 * en vez de adentro de MagiaSanadoraFields.
 */
export default function SerieSelector() {
  const { mode } = useGiftMode();

  return (
    <div className="form-group">
      <label className="required">Serie elegida</label>
      <div className="radio-group" style={{ marginTop: 4 }}>
        {SERIES.map((s) => (
          <label key={s.value} style={{ cursor: "pointer" }}>
            <input type="radio" name="serie" value={s.value} required />
            <span>{s.label}</span>
          </label>
        ))}
      </div>
      {mode === "regalar" && (
        <p className="hint">De esto depende el precio del regalo — el resto del formulario lo completa quien lo recibe.</p>
      )}
    </div>
  );
}
