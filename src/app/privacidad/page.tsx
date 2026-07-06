import Link from "next/link";

export const metadata = {
  title: "Política de Privacidad — Monje Urbano Libre",
};

export default function PrivacidadPage() {
  return (
    <div className="form-plain" style={{ maxWidth: 760, margin: "0 auto", padding: "140px 24px 80px" }}>
      <div className="form-header">
        <Link href="/" className="back">← Volver al inicio</Link>
        <h1>Política de Privacidad</h1>
        <p>Última actualización: julio de 2026</p>
      </div>

      <div style={{ color: "#ccc", lineHeight: 1.8, fontSize: "0.95rem" }}>
        <p style={{ marginBottom: 24 }}>
          En Monje Urbano Libre (&quot;nosotros&quot;) nos tomamos en serio la privacidad de
          quienes visitan y usan <strong>monjeurbanolibre.com</strong> /{" "}
          <strong>monjeurbanolibre.com.ar</strong> (el &quot;Sitio&quot;). Esta política explica
          qué datos recopilamos, para qué los usamos y qué derechos tenés sobre ellos.
        </p>

        <h2 style={{ fontSize: "1.15rem", marginTop: 36, marginBottom: 10, color: "#eee" }}>
          1. Responsable del tratamiento
        </h2>
        <p style={{ marginBottom: 16 }}>
          Monje Urbano Libre es responsable de los datos que recopila a través de este Sitio.
          Podés contactarnos en{" "}
          <a href="mailto:info@monjeurbanolibre.com" style={{ textDecoration: "underline" }}>
            info@monjeurbanolibre.com
          </a>{" "}
          ante cualquier consulta sobre esta política o tus datos personales.
        </p>

        <h2 style={{ fontSize: "1.15rem", marginTop: 36, marginBottom: 10, color: "#eee" }}>
          2. Qué datos recopilamos
        </h2>
        <p style={{ marginBottom: 10 }}>Según el formulario que completes, podemos recopilar:</p>
        <ul style={{ marginBottom: 16, paddingLeft: 22 }}>
          <li style={{ marginBottom: 6 }}>
            <strong>Datos de contacto:</strong> nombre, apellido, email, WhatsApp, país, ciudad,
            edad y género.
          </li>
          <li style={{ marginBottom: 6 }}>
            <strong>Contenido de tu consulta o pedido:</strong> las respuestas que compartís en
            cada formulario para que podamos elaborar tu Manifiesto, Cartografía, Ritual Matutino
            o Magia Sanadora. En el caso de <strong>Cartografía del Síntoma</strong> en particular,
            esto puede incluir información sobre síntomas físicos y estados emocionales — la
            compartís de forma voluntaria y la usamos exclusivamente para elaborar tu entrega.
          </li>
          <li style={{ marginBottom: 6 }}>
            <strong>Testimonios (Semillas del Camino):</strong> si elegís compartir tu experiencia,
            según la opción de privacidad que marques, tu nombre, ciudad y relato pueden publicarse
            en el Sitio.
          </li>
          <li style={{ marginBottom: 6 }}>
            <strong>Datos de pago:</strong> gestionados directamente por Mercado Pago o por la
            pasarela internacional correspondiente — nosotros no almacenamos números de tarjeta ni
            credenciales de pago.
          </li>
        </ul>

        <h2 style={{ fontSize: "1.15rem", marginTop: 36, marginBottom: 10, color: "#eee" }}>
          3. Para qué usamos tus datos
        </h2>
        <ul style={{ marginBottom: 16, paddingLeft: 22 }}>
          <li style={{ marginBottom: 6 }}>Elaborar y entregarte el servicio o producto que solicitaste.</li>
          <li style={{ marginBottom: 6 }}>Responder tus consultas.</li>
          <li style={{ marginBottom: 6 }}>
            Enviarte comunicaciones sobre tu pedido (confirmaciones, coordinación de entrega).
          </li>
          <li style={{ marginBottom: 6 }}>
            Enviarte novedades por email si te suscribiste voluntariamente a nuestro newsletter
            (podés darte de baja en cualquier momento).
          </li>
          <li style={{ marginBottom: 6 }}>
            Publicar tu testimonio en Semillas del Camino, únicamente si lo autorizaste y respetando
            la opción de privacidad que elegiste.
          </li>
        </ul>
        <p style={{ marginBottom: 16 }}>
          No vendemos tus datos personales a terceros bajo ninguna circunstancia.
        </p>

        <h2 style={{ fontSize: "1.15rem", marginTop: 36, marginBottom: 10, color: "#eee" }}>
          4. Con quién compartimos tus datos
        </h2>
        <p style={{ marginBottom: 10 }}>
          Usamos algunos proveedores externos para poder ofrecerte el servicio, que actúan como
          encargados del tratamiento de datos por nuestra cuenta:
        </p>
        <ul style={{ marginBottom: 16, paddingLeft: 22 }}>
          <li style={{ marginBottom: 6 }}>
            <strong>Supabase</strong> (base de datos en la nube) y <strong>Vercel</strong>{" "}
            (alojamiento del Sitio).
          </li>
          <li style={{ marginBottom: 6 }}>
            <strong>Mercado Pago</strong> y la pasarela de pago internacional habilitada, para
            procesar pagos.
          </li>
          <li style={{ marginBottom: 6 }}>
            <strong>Zoho Mail</strong>, para gestionar el correo electrónico del proyecto.
          </li>
        </ul>

        <h2 style={{ fontSize: "1.15rem", marginTop: 36, marginBottom: 10, color: "#eee" }}>
          5. Almacenamiento en tu navegador (localStorage)
        </h2>
        <p style={{ marginBottom: 16 }}>
          Para que no tengas que volver a escribir tus datos cada vez que completás un formulario
          en este Sitio, guardamos algunos de ellos (nombre, email, WhatsApp, etc.) directamente en
          la memoria de tu propio navegador (localStorage), no en nuestros servidores. Esta
          información queda solo en tu dispositivo y podés borrarla en cualquier momento limpiando
          los datos de navegación de tu navegador para este Sitio.
        </p>

        <h2 style={{ fontSize: "1.15rem", marginTop: 36, marginBottom: 10, color: "#eee" }}>
          6. Cuánto tiempo conservamos tus datos
        </h2>
        <p style={{ marginBottom: 16 }}>
          Conservamos tus datos mientras sea necesario para prestarte el servicio solicitado, para
          cumplir obligaciones legales o contables, o hasta que nos pidas que los eliminemos (ver
          punto siguiente).
        </p>

        <h2 style={{ fontSize: "1.15rem", marginTop: 36, marginBottom: 10, color: "#eee" }}>
          7. Tus derechos
        </h2>
        <p style={{ marginBottom: 16 }}>
          Podés pedirnos en cualquier momento acceder a tus datos, corregirlos, o eliminarlos de
          nuestra base (incluyendo dar de baja tu suscripción al newsletter o retirar un testimonio
          publicado), escribiéndonos a{" "}
          <a href="mailto:info@monjeurbanolibre.com" style={{ textDecoration: "underline" }}>
            info@monjeurbanolibre.com
          </a>
          .
        </p>

        <h2 style={{ fontSize: "1.15rem", marginTop: 36, marginBottom: 10, color: "#eee" }}>
          8. Menores de edad
        </h2>
        <p style={{ marginBottom: 16 }}>
          Nuestros servicios están dirigidos a personas mayores de 18 años. No recopilamos
          intencionalmente datos de menores de edad.
        </p>

        <h2 style={{ fontSize: "1.15rem", marginTop: 36, marginBottom: 10, color: "#eee" }}>
          9. Cambios a esta política
        </h2>
        <p style={{ marginBottom: 16 }}>
          Podemos actualizar esta política ocasionalmente. La fecha de la última actualización
          figura al inicio de esta página.
        </p>

        <p style={{ marginTop: 40, fontSize: "0.85rem", color: "#777" }}>
          Ver también nuestros{" "}
          <Link href="/terminos" style={{ textDecoration: "underline" }}>
            Términos y Condiciones
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
