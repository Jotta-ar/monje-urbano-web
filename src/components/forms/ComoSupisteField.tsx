export default function ComoSupisteField() {
  return (
    <div className="form-group">
      <label>¿Cómo supiste de este servicio? (opcional)</label>
      <select name="como_supiste" defaultValue="">
        <option value="">Elegí una opción</option>
        <option>Instagram</option>
        <option>YouTube</option>
        <option>Recomendación</option>
        <option>Otra</option>
      </select>
    </div>
  );
}
