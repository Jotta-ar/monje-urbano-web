import Link from "next/link";

export const metadata = {
  title: "Términos y Condiciones — Monje Urbano Libre",
};

export default function TerminosPage() {
  return (
    <div className="form-plain" style={{ maxWidth: 760, margin: "0 auto", padding: "140px 24px 80px" }}>
      <div className="form-header">
        <Link href="/" className="back">← Volver al inicio</Link>
        <h1>Términos y Condiciones</h1>
        <p>Última actualización: julio de 2026</p>
      </div>

      <div style={{ color: "#ccc", lineHeight: 1.8, fontSize: "0.95rem" }}>
        <p style={{ marginBottom: 24 }}>
          Estos Términos y Condiciones regulan el uso del sitio web{" "}
          <strong>monjeurbanolibre.com</strong> / <strong>monjeurbanolibre.com.ar</strong> (el
          &quot;Sitio&quot;) y la contratación de los servicios y productos ofrecidos por Monje
          Urbano Libre (&quot;nosotros&quot;, &quot;el Monje&quot;). Al usar el Sitio o contratar
          alguno de nuestros servicios, aceptás estos términos.
        </p>

        <h2 style={{ fontSize: "1.15rem", marginTop: 36, marginBottom: 10, color: "#eee" }}>
          1. Naturaleza de los servicios
        </h2>
        <p style={{ marginBottom: 16 }}>
          Los servicios ofrecidos (Magia Sanadora, Manifiesto Personalizado, Cartografía del
          Síntoma, Ritual Matutino Personalizado) son servicios <strong>espirituales, simbólicos y
          de acompañamiento personal</strong>. No constituyen ni reemplazan diagnóstico,
          tratamiento médico, psicológico ni psiquiátrico. Ante una urgencia de salud física o
          mental, dolor agudo o cualquier situación que lo requiera, siempre debés acudir a un
          profesional de la salud y no discontinuar ningún tratamiento o medicación indicada sin
          supervisión profesional.
        </p>

        <h2 style={{ fontSize: "1.15rem", marginTop: 36, marginBottom: 10, color: "#eee" }}>
          2. Cómo funciona la contratación
        </h2>
        <p style={{ marginBottom: 16 }}>
          Cada servicio se solicita completando el formulario correspondiente en el Sitio y
          abonando el precio vigente al momento de la compra. Los precios pueden actualizarse sin
          aviso previo; el precio aplicable es el vigente al momento de confirmar el pago. Los
          plazos de entrega estimados se indican en cada servicio (habitualmente entre 3 y 5 días
          hábiles desde que se recibe el pago y el formulario completo) y pueden variar según la
          demanda.
        </p>

        <h2 style={{ fontSize: "1.15rem", marginTop: 36, marginBottom: 10, color: "#eee" }}>
          3. Compras como regalo
        </h2>
        <p style={{ marginBottom: 16 }}>
          Si elegís la opción de regalo, quien compra abona el servicio sin completar el
          formulario de contenido; luego se le envía a la persona destinataria un link para que
          complete sus propios datos sin costo adicional. Es responsabilidad de quien compra
          asegurarse de que el email y/o WhatsApp del destinatario sean correctos para que el link
          le llegue.
        </p>

        <h2 style={{ fontSize: "1.15rem", marginTop: 36, marginBottom: 10, color: "#eee" }}>
          4. Cancelaciones y reembolsos
        </h2>
        <p style={{ marginBottom: 16 }}>
          Podés solicitar la cancelación y el reembolso completo de tu pedido siempre que{" "}
          <strong>todavía no hayamos comenzado a elaborar tu contenido</strong> (es decir, antes
          de iniciar la lectura, redacción o ritual correspondiente). Una vez que el proceso
          creativo o ritual se puso en marcha, no es posible ofrecer reembolsos, dado que se trata
          de un trabajo personalizado, hecho especialmente para vos o para la persona
          destinataria, que no puede reutilizarse ni revenderse. Para solicitar una cancelación,
          escribinos a{" "}
          <a href="mailto:info@monjeurbanolibre.com" style={{ textDecoration: "underline" }}>
            info@monjeurbanolibre.com
          </a>{" "}
          lo antes posible.
        </p>
        <p style={{ marginBottom: 16 }}>
          Los productos físicos (Talismanes, Porta Sahumerios) se rigen además por las condiciones
          de cambio habituales ante defectos de fabricación o envío: si tu producto llega dañado o
          incorrecto, escribinos dentro de los 5 días de recibido para coordinar la solución.
        </p>

        <h2 style={{ fontSize: "1.15rem", marginTop: 36, marginBottom: 10, color: "#eee" }}>
          5. Medios de pago
        </h2>
        <p style={{ marginBottom: 16 }}>
          Los pagos en pesos argentinos se procesan a través de Mercado Pago. Los pagos desde el
          exterior se procesan a través de la pasarela internacional habilitada en cada momento en
          el Sitio. No almacenamos los datos completos de tu tarjeta ni de tu cuenta de pago —
          esa información es gestionada directamente por la pasarela de pago correspondiente.
        </p>

        <h2 style={{ fontSize: "1.15rem", marginTop: 36, marginBottom: 10, color: "#eee" }}>
          6. Semillas del Camino (testimonios)
        </h2>
        <p style={{ marginBottom: 16 }}>
          Si compartís tu experiencia a través del formulario &quot;Semillas del Camino&quot;,
          vas a poder elegir cómo querés que se publique tu testimonio (con nombre completo, solo
          nombre, seudónimo, en forma anónima, o de forma completamente privada). Respetamos
          siempre la opción que elijas; si elegís que quede privada, tu testimonio no se publica
          bajo ninguna circunstancia y queda solo para uso interno.
        </p>

        <h2 style={{ fontSize: "1.15rem", marginTop: 36, marginBottom: 10, color: "#eee" }}>
          7. Propiedad intelectual
        </h2>
        <p style={{ marginBottom: 16 }}>
          El contenido que recibís (Manifiesto, Cartografía, Ritual Matutino) es para tu uso
          personal. Los textos, diseños, símbolos y marca &quot;Monje Urbano Libre&quot; son
          propiedad de Monje Urbano Libre y no pueden reproducirse, revenderse ni utilizarse
          comercialmente sin autorización previa.
        </p>

        <h2 style={{ fontSize: "1.15rem", marginTop: 36, marginBottom: 10, color: "#eee" }}>
          8. Limitación de responsabilidad
        </h2>
        <p style={{ marginBottom: 16 }}>
          Nuestros servicios se ofrecen &quot;tal cual&quot;, con la intención genuina de
          acompañar procesos personales desde una mirada espiritual y simbólica. No garantizamos
          resultados específicos, ya que estos dependen de múltiples factores personales ajenos a
          nuestro control. En la máxima medida permitida por la ley, Monje Urbano Libre no será
          responsable por daños indirectos derivados del uso de sus servicios.
        </p>

        <h2 style={{ fontSize: "1.15rem", marginTop: 36, marginBottom: 10, color: "#eee" }}>
          9. Ley aplicable
        </h2>
        <p style={{ marginBottom: 16 }}>
          Estos términos se rigen por las leyes de la República Argentina. Cualquier controversia
          se someterá a los tribunales ordinarios competentes de Argentina, sin perjuicio de las
          normas de protección al consumidor que correspondan según tu país de residencia.
        </p>

        <h2 style={{ fontSize: "1.15rem", marginTop: 36, marginBottom: 10, color: "#eee" }}>
          10. Contacto
        </h2>
        <p style={{ marginBottom: 16 }}>
          Ante cualquier consulta sobre estos Términos, escribinos a{" "}
          <a href="mailto:info@monjeurbanolibre.com" style={{ textDecoration: "underline" }}>
            info@monjeurbanolibre.com
          </a>
          .
        </p>

        <p style={{ marginTop: 40, fontSize: "0.85rem", color: "#777" }}>
          Ver también nuestra{" "}
          <Link href="/privacidad" style={{ textDecoration: "underline" }}>
            Política de Privacidad
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
