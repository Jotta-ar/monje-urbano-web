const EMOCIONES = ["Ansiedad", "Tristeza", "Enojo", "Miedo", "Culpa", "Vergüenza", "Otra"];
const LADOS = ["Derecho", "Izquierdo", "Central", "Alterna", "No lo sé"];

export default function CartografiaFields() {
  return (
    <>
      <h2 style={{ marginTop: 32 }}>Tu síntoma</h2>

      <div className="form-group">
        <label className="required">¿Cuál es el síntoma principal que querés cartografiar?</label>
        <textarea name="sintoma_principal" required />
      </div>

      <div className="form-group">
        <label className="required">¿En qué zona del cuerpo lo sentís?</label>
        <input type="text" name="zona_cuerpo" required />
      </div>

      <div className="form-group">
        <label className="required">¿Es en lado derecho, izquierdo o central?</label>
        <div className="radio-group">
          {LADOS.map((l) => (
            <label key={l}>
              <input type="radio" name="lado" value={l} required />
              <span>{l}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="required">Intensidad actual (0 a 10)</label>
        <input type="number" name="intensidad" min={0} max={10} required />
      </div>

      <div className="form-group">
        <label className="required">¿Cuándo comenzó? Indicá fecha aproximada y contexto.</label>
        <textarea name="cuando_comenzo" required />
      </div>

      <div className="form-group">
        <label className="required">¿Qué lo empeora o dispara?</label>
        <textarea name="que_lo_empeora" placeholder="Situaciones, emociones, posturas, alimentos, etc." required />
      </div>

      <div className="form-group">
        <label className="required">¿Qué lo alivia, aunque sea un poco?</label>
        <textarea name="que_lo_alivia" required />
      </div>

      <div className="form-group">
        <label className="required">¿Es recurrente? ¿Cada cuánto aparece o cuánto dura?</label>
        <textarea name="recurrencia" required />
      </div>

      <h2 style={{ marginTop: 32 }}>Contexto emocional y biográfico</h2>

      <div className="form-group">
        <label className="required">Si tuvieras que ponerle un nombre a la emoción que acompaña al síntoma, ¿cuál sería?</label>
        <div className="checkbox-group">
          {EMOCIONES.map((e) => (
            <label key={e}>
              <input type="checkbox" name="emocion" value={e} />
              <span>{e}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="required">¿Ocurrió algún evento significativo cerca del inicio o de una recaída?</label>
        <textarea name="evento_significativo" placeholder="Cambio, pérdida, conflicto, decisión" required />
      </div>

      <div className="form-group">
        <label className="required">¿Qué te gustaría poder sentir en tu día a día si este síntoma se ordenara?</label>
        <textarea name="que_te_gustaria_sentir" required />
      </div>

      <div className="form-group">
        <label>¿Hay frases internas que se repiten cuando aparece el síntoma? (opcional)</label>
        <textarea name="frases_internas" placeholder='Ej: "tengo que poder con todo", "no puedo fallar"' />
      </div>

      <h2 style={{ marginTop: 32 }}>Información complementaria</h2>
      <div className="form-group">
        <label>¿Querés agregar algo que consideres importante? (opcional)</label>
        <textarea name="algo_importante" />
      </div>

      <h2 style={{ marginTop: 32 }}>Entrega y preferencias</h2>
      <div className="form-group">
        <label>Nombre a mostrar en el documento (opcional, si preferís iniciales o alias)</label>
        <input type="text" name="nombre_documento" />
      </div>

      <h2 style={{ marginTop: 32 }}>Consentimientos</h2>
      <div className="checkbox-group">
        <label>
          <input type="checkbox" name="consentimiento_alcance" required />
          <span className="checkbox-legal">
            Comprendo que Cartografía del Síntoma es un servicio espiritual y educativo. No
            reemplaza diagnóstico ni tratamiento médico. Ante dolor agudo o urgencias acudiré al
            servicio de salud y no suspenderé medicación sin indicación profesional.
          </span>
        </label>
        <label>
          <input type="checkbox" name="consentimiento_datos" required />
          <span className="checkbox-legal">
            Autorizo el uso de mis datos solo para la elaboración de mi cartografía y
            comunicaciones relacionadas al servicio. Mi información se mantendrá privada y no se
            publicará sin mi consentimiento.
          </span>
        </label>
        <label>
          <input type="checkbox" name="consentimiento_entrega" required />
          <span className="checkbox-legal">
            Acepto recibir mi entrega en PDF por e-mail y confirmo que revisé la carpeta de
            spam/correo no deseado si fuera necesario.
          </span>
        </label>
      </div>
    </>
  );
}
