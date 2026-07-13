const TONOS = ["Breve", "Poético", "Claro", "Inspirador", "Contundente", "Introspectivo", "Otro"];
const ALMA_NECESITA = ["Paz", "Dirección", "Fuerza", "Fe", "Calma", "Claridad", "Libertad", "Soltar", "Otro"];

export default function ManifiestoFields() {
  return (
    <>
      <h2 style={{ marginTop: 32 }}>Preguntas guía</h2>

      <div className="form-group">
        <label className="required">¿Qué estás atravesando en este momento de tu vida?</label>
        <textarea
          name="que_atraviesas"
          placeholder="Puede ser una etapa, una búsqueda, una crisis, una decisión pendiente o simplemente una sensación."
          required
        />
      </div>

      <div className="form-group">
        <label className="required">¿Qué sentís que más necesita tu alma?</label>
        <div className="radio-group">
          {ALMA_NECESITA.map((a) => (
            <label key={a}>
              <input type="radio" name="alma_necesita" value={a} required />
              <span>{a}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Nombre a mostrar en el manifiesto (opcional, si preferís iniciales o alias)</label>
        <input type="text" name="nombre_manifiesto" />
      </div>

      <div className="form-group">
        <label className="required">¿Hay alguna palabra, imagen o símbolo que tenga fuerza para vos hoy?</label>
        <textarea
          name="palabra_simbolo"
          placeholder="Puede ser una palabra clave, un animal, un paisaje, una sensación, un objeto, una canción."
          required
        />
      </div>

      <div className="form-group">
        <label>¿Querés dedicar este manifiesto a alguien o incluir algún nombre especial? (opcional)</label>
        <input type="text" name="dedicatoria" placeholder="Nombre o dedicatoria" />
      </div>

      <div className="form-group">
        <label>¿Cómo te gustaría que sea tu manifiesto? (tono, opcional)</label>
        <div className="checkbox-group">
          {TONOS.map((t) => (
            <label key={t}>
              <input type="checkbox" name="tono" value={t} />
              <span>{t}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>¿Hay algo más que quieras compartir antes de recibir tu manifiesto? (opcional)</label>
        <textarea name="algo_mas" placeholder="Espacio libre" />
      </div>
    </>
  );
}
