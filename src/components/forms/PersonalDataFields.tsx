export default function PersonalDataFields() {
  return (
    <>
      <div className="form-row">
        <div className="form-group">
          <label className="required">Nombre</label>
          <input type="text" name="nombre" placeholder="Nombre" required />
        </div>
        <div className="form-group">
          <label className="required">Apellido</label>
          <input type="text" name="apellido" placeholder="Apellido" required />
        </div>
      </div>

      <div className="form-group">
        <label className="required">Email</label>
        <input type="email" name="email" placeholder="tu@email.com" required />
      </div>

      <div className="form-group">
        <label className="required">WhatsApp</label>
        <input type="tel" name="whatsapp" placeholder="+54 9 11 ..." required />
        <p className="hint">Con código de país</p>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="required">País</label>
          <input type="text" name="pais" placeholder="Argentina" required />
        </div>
        <div className="form-group">
          <label className="required">Ciudad</label>
          <input type="text" name="ciudad" placeholder="Ciudad" required />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="required">Edad</label>
          <input type="number" name="edad" placeholder="34" min={1} required />
        </div>
        <div className="form-group">
          <label className="required">Género</label>
          <select name="genero" required defaultValue="">
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
