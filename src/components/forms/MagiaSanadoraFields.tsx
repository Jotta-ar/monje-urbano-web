const ANTIGUEDADES = ["Menos de 1 mes", "1–6 meses", "6–12 meses", "Más de 1 año"];
const FRECUENCIAS = ["Esporádico", "Semanal", "Diario"];

export default function MagiaSanadoraFields() {
  return (
    <>
      <h2 style={{ marginTop: 32 }}>Tu caso a trabajar</h2>

      <div className="form-group">
        <label className="required">Tema o zona del cuerpo</label>
        <input type="text" name="tema_zona" placeholder="Espalda baja / migraña / ansiedad" required />
      </div>

      <div className="form-group">
        <label className="required">Descripción breve</label>
        <textarea name="descripcion" placeholder="2 a 5 líneas sobre lo que sucede y cuándo se presenta" required />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="required">Intensidad actual (0 a 10)</label>
          <input type="number" name="intensidad" min={0} max={10} required />
        </div>
        <div className="form-group">
          <label className="required">Antigüedad</label>
          <div className="radio-group">
            {ANTIGUEDADES.map((a) => (
              <label key={a}>
                <input type="radio" name="antiguedad" value={a} required />
                <span>{a}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="required">Frecuencia</label>
        <div className="radio-group">
          {FRECUENCIAS.map((f) => (
            <label key={f}>
              <input type="radio" name="frecuencia" value={f} required />
              <span>{f}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Adjuntar foto de la zona (opcional)</label>
        <input type="file" name="foto" accept="image/jpeg,image/png" />
        <p className="hint">Solo si te sentís cómodo/a.</p>
      </div>

      <h2 style={{ marginTop: 32 }}>Alineación y consentimiento</h2>

      <div className="form-group">
        <label className="required">Intención en 1 frase</label>
        <input type="text" name="intencion" placeholder="Ej.: Dormir sin dolor de cabeza" required />
      </div>

      <div className="checkbox-group">
        <label>
          <input type="checkbox" name="consentimiento_ritual" required />
          <span className="checkbox-legal">
            Confirmo que deseo recibir una Magia Sanadora a distancia y que comprendo que no
            sustituye atención médica o psicológica.
          </span>
        </label>
        <label>
          <input type="checkbox" name="consentimiento_datos" required />
          <span className="checkbox-legal">
            Acepto el uso de mis datos para realizar el ritual y para contactarme en relación a
            este servicio.
          </span>
        </label>
      </div>
    </>
  );
}
