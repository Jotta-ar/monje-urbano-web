import "server-only";
import { SERVICIO_TITULOS } from "@/lib/mercadopago";
import { PRODUCTO_MENSAJES } from "@/lib/productos";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

type CompraParaEmail = {
  numero: number;
  servicio: string;
  monto: number | null;
  moneda: string;
  es_regalo: boolean;
  token: string;
  comprador_nombre: string | null;
  comprador_apellido: string | null;
  comprador_email: string | null;
  destinatario_nombre: string | null;
  destinatario_email: string | null;
};

// Diseño de mails: el sitio entero es de tema oscuro, así que la tarjeta del
// mail también lo es a propósito (no una tarjeta blanca) — así el logo va
// siempre en su versión blanca con fondo transparente (logo-completo-blanco),
// nunca la negra, porque no tendría contraste. Esta es la regla para
// CUALQUIER mail transaccional del proyecto, no solo estas plantillas.
//
// Pompiere es una letra cursiva bastante fina — hay que usarla más grande de
// lo normal para que se lea bien en pantallas chicas de celular. Pirata One
// es gótica/blackletter, también necesita buen tamaño.
// Ojo: muchos clientes de mail (sobre todo las apps de Gmail/Outlook en el
// celular) ignoran @font-face y directamente muestran la tipografía de
// respaldo (Georgia) — por eso el <style> Y el fallback inline importan acá.
//
// Regla dura: TODO <h2>/<p> lleva su propio color inline (nunca depender del
// <style> de arriba ni de la herencia del <td> padre) — varias apps de mail
// (Gmail incluido) borran el <style> del <head> y quedan solo los estilos
// inline; sin color explícito, el texto cae al gris por default del cliente,
// casi ilegible sobre la tarjeta oscura (bug real visto en producción).
const ENVOLTORIO = (contenido: string) => `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="color-scheme" content="dark light" />
    <meta name="supported-color-schemes" content="dark light" />
    <style>
      @font-face {
        font-family: 'Pirata One';
        src: url('${SITE_URL}/fonts/PirataOne-Regular.ttf') format('truetype');
      }
      @font-face {
        font-family: 'Pompiere';
        src: url('${SITE_URL}/fonts/Pompiere-Regular.ttf') format('truetype');
      }
      html, body { color-scheme: only light; }
      h2 { font-family: 'Pirata One', Georgia, serif; font-size: 32px; font-weight: normal; color: #fff; }
      p { font-family: 'Pompiere', Georgia, serif; font-size: 20px; line-height: 1.6; color: #eee; }
      /* Varios clientes (Gmail, y también la app de Zoho) ignoran los meta
         color-scheme de arriba y le aplican su propio modo oscuro automático
         a esta tarjeta (que ya es oscura), invirtiéndola a blanca. Dos capas
         de defensa:
         1) el fondo va como linear-gradient con los dos extremos del MISMO
            color en vez de background-color plano — estos motores de
            "auto dark mode" buscan colores sólidos para invertir y no saben
            interpretar un gradiente, así que lo dejan pasar tal cual.
         2) estas reglas apuntan a los hooks que Gmail agrega en sus propios
            elementos ([data-ogsc]/[data-ogsb]) para forzar de vuelta nuestra
            paleta real, por si el gradiente no alcanza. */
      [data-ogsc] .bg-fondo, [data-ogsb] .bg-fondo { background: #000000 !important; }
      [data-ogsc] .bg-tarjeta, [data-ogsb] .bg-tarjeta { background: #161616 !important; }
      [data-ogsc] h2, [data-ogsb] h2 { color: #ffffff !important; }
      [data-ogsc] p, [data-ogsb] p { color: #eeeeee !important; }
      [data-ogsc] .texto-tenue, [data-ogsb] .texto-tenue { color: #999999 !important; }
      [data-ogsc] .link-tenue, [data-ogsb] .link-tenue { color: #cccccc !important; }
      [data-ogsc] .boton-cta, [data-ogsb] .boton-cta { background: #ffffff !important; color: #111111 !important; }
    </style>
  </head>
  <body style="margin:0;background:linear-gradient(#000000,#000000);">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="bg-fondo" style="background:linear-gradient(#000000,#000000);">
      <tr>
        <td align="center" style="padding:40px 20px;">
          <table role="presentation" width="520" cellpadding="0" cellspacing="0" border="0" class="bg-tarjeta" style="width:100%;max-width:520px;background:linear-gradient(#161616,#161616);border-radius:4px;">
            <tr>
              <td style="padding:36px 32px;font-family:'Pompiere',Georgia,serif;font-size:20px;line-height:1.6;color:#eee;">
                <div style="text-align:center;margin-bottom:24px;">
                  <img src="${SITE_URL}/logos/logo-completo-blanco.png" alt="Monje Urbano Libre" width="280" style="max-width:280px;height:auto;" />
                </div>
                ${contenido}
                <p class="texto-tenue" style="margin-top:32px;font-family:'Pirata One',Georgia,serif;font-size:16px;color:#888;text-align:center;">
                  Monje Urbano Libre — Silencio, presencia y propósito.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

/** Aviso interno: le llega al admin cuando se confirma el pago de un pedido. */
export function emailAvisoAdmin(compra: CompraParaEmail): { subject: string; html: string } {
  const titulo = SERVICIO_TITULOS[compra.servicio] ?? compra.servicio;
  const comprador = [compra.comprador_nombre, compra.comprador_apellido].filter(Boolean).join(" ") || "—";
  const monto = compra.monto != null ? `${compra.moneda} ${compra.monto.toLocaleString("es-AR")}` : "—";

  return {
    subject: `Pedido #${compra.numero} pagado — ${titulo}`,
    html: ENVOLTORIO(`
      <h2 style="margin:0 0 20px;font-family:'Pirata One',Georgia,serif;font-size:32px;font-weight:normal;color:#fff;">Nuevo pedido pagado</h2>
      <p style="color:#eee;"><strong>Pedido:</strong> #${compra.numero}</p>
      <p style="color:#eee;"><strong>Servicio:</strong> ${titulo}${compra.es_regalo ? " (regalo)" : ""}</p>
      <p style="color:#eee;"><strong>Monto:</strong> ${monto}</p>
      <p style="color:#eee;"><strong>Comprador/a:</strong> ${comprador}${compra.comprador_email ? ` — ${compra.comprador_email}` : ""}</p>
      ${
        compra.es_regalo
          ? `<p style="color:#eee;"><strong>Destinatario/a:</strong> ${compra.destinatario_nombre ?? "—"} — ${compra.destinatario_email ?? "—"}</p>
             <p style="color:#eee;">Ya le mandamos el link para completar su formulario.</p>`
          : `<p style="color:#eee;">El formulario ya está completo, listo para trabajar.</p>`
      }
      <p style="margin-top:24px;color:#eee;">
        <a href="${SITE_URL}/admin" class="link-tenue" style="color:#ccc;">Ver en el panel de administración →</a>
      </p>
    `),
  };
}

type TransferenciaPendienteParaEmail = {
  numero: number;
  servicio: string;
  monto: number | null;
  compradorNombre: string | null;
  compradorApellido: string | null;
  compradorEmail: string | null;
  tieneComprobante: boolean;
  metodo: "banco" | "usdt";
};

/** Aviso interno: le llega al admin cuando alguien elige un método de pago manual (transferencia bancaria o USDT) — no confirma el pago, solo avisa que hay que estar atento y confirmarlo a mano en /admin cuando entre el dinero. */
export function emailAvisoTransferenciaPendiente(
  compra: TransferenciaPendienteParaEmail
): { subject: string; html: string } {
  const titulo = SERVICIO_TITULOS[compra.servicio] ?? compra.servicio;
  const comprador =
    [compra.compradorNombre, compra.compradorApellido].filter(Boolean).join(" ") || "—";
  const monto = compra.monto != null ? `USD ${compra.monto.toLocaleString("en-US")}` : "A confirmar";
  const nombreMetodo = compra.metodo === "usdt" ? "USDT" : "transferencia";

  return {
    subject: `Pedido #${compra.numero} — esperando ${nombreMetodo} — ${titulo}`,
    html: ENVOLTORIO(`
      <h2 style="margin:0 0 20px;font-family:'Pirata One',Georgia,serif;font-size:32px;font-weight:normal;color:#fff;">${
        compra.metodo === "usdt" ? "Pago en USDT pendiente" : "Transferencia pendiente"
      }</h2>
      <p style="color:#eee;"><strong>Pedido:</strong> #${compra.numero}</p>
      <p style="color:#eee;"><strong>Servicio:</strong> ${titulo}</p>
      <p style="color:#eee;"><strong>Monto:</strong> ${monto}</p>
      <p style="color:#eee;"><strong>Comprador/a:</strong> ${comprador}${compra.compradorEmail ? ` — ${compra.compradorEmail}` : ""}</p>
      <p style="color:#eee;">${
        compra.tieneComprobante
          ? "Ya subió un comprobante — vas a poder verlo dentro del PDF del pedido."
          : "Todavía no subió comprobante — puede que lo suba más tarde con el link de su pedido."
      }</p>
      <p style="margin-top:16px;color:#eee;">Este pedido queda como pendiente hasta que confirmes a mano que ${
        compra.metodo === "usdt" ? "llegó el USDT" : "el dinero entró"
      } — desde el panel, tildá "Confirmar transferencia recibida" en su fila.</p>
      <p style="margin-top:24px;color:#eee;">
        <a href="${SITE_URL}/admin" class="link-tenue" style="color:#ccc;">Ver en el panel de administración →</a>
      </p>
    `),
  };
}

/** Le llega a quien compró (regalo o no), agradeciendo y confirmando los próximos pasos. */
export function emailGraciasComprador(compra: CompraParaEmail): { subject: string; html: string } {
  const producto = PRODUCTO_MENSAJES[compra.servicio];
  if (producto) {
    const parrafos = producto.cuerpo
      .split("\n\n")
      .map((p) => `<p style="color:#eee;">${p}</p>`)
      .join("\n");
    return {
      subject: producto.subtitulo,
      html: ENVOLTORIO(`
        <h2 style="margin:0 0 20px;font-family:'Pirata One',Georgia,serif;font-size:32px;font-weight:normal;color:#fff;">${producto.subtitulo}</h2>
        ${parrafos}
      `),
    };
  }

  const titulo = SERVICIO_TITULOS[compra.servicio] ?? compra.servicio;

  return {
    subject: `¡Gracias por tu ${compra.es_regalo ? "regalo" : "compra"}!`,
    html: ENVOLTORIO(`
      <h2 style="margin:0 0 20px;font-family:'Pirata One',Georgia,serif;font-size:32px;font-weight:normal;color:#fff;">¡Gracias por tu confianza!</h2>
      ${
        compra.es_regalo
          ? `<p style="color:#eee;">Recibimos tu pago de <strong>${titulo}</strong>. Ya le avisamos a
             ${compra.destinatario_nombre ?? "quien lo recibe"} por mail para que complete su
             formulario sin tener que pagar nada.</p>`
          : `<p style="color:#eee;">Recibimos tu pago de <strong>${titulo}</strong>. Ya está todo listo de tu lado —
             me pongo en marcha y te contacto para los próximos pasos.</p>`
      }
      <p class="texto-tenue" style="margin-top:24px;font-family:'Pirata One',Georgia,serif;font-size:20px;color:#aaa;">Silencio, presencia y propósito.</p>
    `),
  };
}

type ConsultaParaEmail = {
  nombre: string;
  apellido: string;
  email: string;
  whatsapp: string;
  mensaje: string;
  servicio: string | null;
  pais: string | null;
  ciudad: string | null;
};

/** Aviso interno: le llega a info@ cada vez que alguien manda una consulta. */
export function emailAvisoConsulta(consulta: ConsultaParaEmail): { subject: string; html: string } {
  const nombreCompleto = [consulta.nombre, consulta.apellido].filter(Boolean).join(" ");
  const ubicacion = [consulta.ciudad, consulta.pais].filter(Boolean).join(", ");
  // OJO: la dirección del "to" en un mailto: NO se codifica con
  // encodeURIComponent (eso convierte la @ en %40 y rompe el link en varios
  // clientes de correo) — solo se codifican los parámetros de la query,
  // como subject.
  const mailtoReply = `mailto:${consulta.email}?subject=${encodeURIComponent(
    "Re: tu consulta a Monje Urbano Libre"
  )}`;

  return {
    subject: `Nueva consulta${consulta.servicio ? ` — ${consulta.servicio}` : ""} de ${nombreCompleto}`,
    html: ENVOLTORIO(`
      <h2 style="margin:0 0 20px;font-family:'Pirata One',Georgia,serif;font-size:32px;font-weight:normal;color:#fff;">Nueva consulta</h2>
      <p style="color:#eee;"><strong>De:</strong> ${nombreCompleto} — ${consulta.email}</p>
      <p style="color:#eee;"><strong>WhatsApp:</strong> ${consulta.whatsapp}</p>
      ${consulta.servicio ? `<p style="color:#eee;"><strong>Servicio:</strong> ${consulta.servicio}</p>` : ""}
      ${ubicacion ? `<p style="color:#eee;"><strong>Ubicación:</strong> ${ubicacion}</p>` : ""}
      <p style="margin-top:16px;color:#eee;"><strong>Consulta:</strong></p>
      <p style="white-space:pre-wrap;color:#eee;">${consulta.mensaje}</p>
      <p style="text-align:center;margin:32px 0;color:#eee;">
        <a href="${mailtoReply}" class="boton-cta" style="background:linear-gradient(#fff,#fff);color:#111;padding:14px 28px;border-radius:4px;text-decoration:none;display:inline-block;">
          Responder por mail
        </a>
      </p>
      <p style="margin-top:8px;color:#eee;">
        <a href="${SITE_URL}/admin" class="link-tenue" style="color:#ccc;">O responder desde el panel de administración →</a>
      </p>
    `),
  };
}

/** Le llega al cliente cuando el admin responde su consulta desde el panel. */
export function emailRespuestaConsulta(mensajeOriginal: string, respuesta: string): { subject: string; html: string } {
  return {
    subject: "Respuesta a tu consulta — Monje Urbano Libre",
    html: ENVOLTORIO(`
      <h2 style="margin:0 0 20px;font-family:'Pirata One',Georgia,serif;font-size:32px;font-weight:normal;color:#fff;">Tu consulta</h2>
      <p class="texto-tenue" style="color:#999;white-space:pre-wrap;border-left:2px solid #444;padding-left:14px;">${mensajeOriginal}</p>
      <h2 style="margin:24px 0 12px;font-family:'Pirata One',Georgia,serif;font-size:32px;font-weight:normal;color:#fff;">Respuesta</h2>
      <p style="white-space:pre-wrap;color:#eee;">${respuesta}</p>
    `),
  };
}

/** Le llega a quien recibe un regalo, con el link para completar su formulario. */
export function emailLinkRegalo(compra: CompraParaEmail): { subject: string; html: string } {
  const titulo = SERVICIO_TITULOS[compra.servicio] ?? compra.servicio;
  const regalador = [compra.comprador_nombre, compra.comprador_apellido].filter(Boolean).join(" ");
  const link = `${SITE_URL}/completar/${compra.token}`;

  return {
    subject: `Te regalaron ${titulo}`,
    html: ENVOLTORIO(`
      <h2 style="margin:0 0 20px;font-family:'Pirata One',Georgia,serif;font-size:32px;font-weight:normal;color:#fff;">Te regalaron ${titulo}</h2>
      <p style="color:#eee;">
        ${regalador ? `${regalador} pensó en vos.` : "Alguien pensó en vos."}
        Ya está todo pago — solo falta que completes tu historia para que empecemos.
      </p>
      <p style="text-align:center;margin:32px 0;color:#eee;">
        <a href="${link}" class="boton-cta" style="background:linear-gradient(#fff,#fff);color:#111;padding:14px 28px;border-radius:4px;text-decoration:none;display:inline-block;">
          Completar mi formulario
        </a>
      </p>
      <p class="texto-tenue" style="font-size:13px;color:#999;">Si el botón no funciona, copiá y pegá este link en tu navegador:<br>${link}</p>
    `),
  };
}
