const DURACIONES = [
  "Menos de 5 minutos",
  "Entre 5 y 10 minutos",
  "Entre 10 y 15 minutos",
  "Más de 15 minutos",
  "No lo sé aún / prefiero que fluya",
];
const TONOS_RITUAL = [
  "Inspirador y motivador",
  "Suave y contemplativo",
  "Directo y estructurado",
  "Poético y profundo",
  "Neutro y claro",
  "Otro",
];

export default function RitualMatutinoFields() {
  return (
    <>
      <div className="form-group" style={{ marginTop: 24 }}>
        <label className="required">Nombre o sobrenombre para el ritual</label>
        <input type="text" name="nombre_ritual" placeholder="Para que el ritual se dirija a vos" required />
      </div>

      <div className="form-group">
        <label className="required">¿Cómo te sentís al comenzar tus días últimamente?</label>
        <textarea name="como_te_sentis" required />
      </div>

      <div className="form-group">
        <label className="required">¿Qué emociones o estados te gustaría cultivar cada mañana?</label>
        <textarea name="emociones_cultivar" placeholder="Ej: calma, foco, gratitud, disciplina, inspiración..." required />
      </div>

      <div className="form-group">
        <label className="required">¿Cómo es tu rutina actual al despertar (si tenés una)?</label>
        <textarea name="rutina_actual" required />
      </div>

      <div className="form-group">
        <label className="required">¿Cuánto tiempo querés que dure tu ritual matutino?</label>
        <div className="radio-group">
          {DURACIONES.map((d) => (
            <label key={d}>
              <input type="radio" name="duracion" value={d} required />
              <span>{d}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="required">¿Qué tipo de lenguaje o tono preferís?</label>
        <div className="radio-group">
          {TONOS_RITUAL.map((t) => (
            <label key={t}>
              <input type="radio" name="tono" value={t} required />
              <span>{t}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="required">¿Hay elementos que te gustaría que estuvieran presentes en el ritual?</label>
        <textarea
          name="elementos"
          placeholder="Ej: afirmaciones, meditaciones breves, movimientos conscientes, respiración, escritura, silencio, símbolos, visualizaciones, conexión espiritual"
          required
        />
      </div>

      <div className="form-group">
        <label className="required">¿Tenés alguna tradición, práctica o camino espiritual que te inspire?</label>
        <textarea name="tradicion" required />
      </div>

      <div className="form-group">
        <label>¿Querés agregar algo más? (opcional)</label>
        <textarea name="algo_mas" />
      </div>
    </>
  );
}
