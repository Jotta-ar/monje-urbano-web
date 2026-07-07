"use client";

import { useGiftMode } from "@/components/gift/GiftModeContext";

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
      <select name="serie" required defaultValue="">
        <option value="" disabled>Elegí una opción</option>
        <option value="unica">Única (1 ritual)</option>
        <option value="serie3">Serie 3</option>
        <option value="serie6">Serie 6</option>
        <option value="serie9">Serie 9</option>
        <option value="intensivo">Quiero consultar tratamiento intensivo diario</option>
      </select>
      {mode === "regalar" && (
        <p className="hint">De esto depende el precio del regalo — el resto del formulario lo completa quien lo recibe.</p>
      )}
    </div>
  );
}
