const OPCIONES = ["Instagram", "YouTube", "Recomendación", "Otra"];

export default function ComoSupisteField() {
  return (
    <div className="form-group">
      <label>¿Cómo supiste de este servicio? (opcional)</label>
      <div className="radio-group">
        {OPCIONES.map((o) => (
          <label key={o}>
            <input type="radio" name="como_supiste" value={o} />
            <span>{o}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
