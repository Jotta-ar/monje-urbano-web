export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="soc">
          <a href="https://instagram.com/monjeurbanolibre" target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
          <a href="https://youtube.com/@monjeurbanolibre" target="_blank" rel="noopener noreferrer">
            YouTube
          </a>
        </div>
        <p>© {new Date().getFullYear()} Monje Urbano Libre — Todos los derechos reservados</p>
        <p>Silencio, presencia y propósito.</p>
      </div>
    </footer>
  );
}
