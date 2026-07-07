import "server-only";
import { SERVICIO_TITULOS } from "@/lib/mercadopago";

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

const ENVOLTORIO = (contenido: string) => `
  <div style="background:#111;padding:40px 20px;font-family:Georgia,'Times New Roman',serif;">
    <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:4px;padding:36px 32px;color:#222;">
      ${contenido}
      <p style="margin-top:32px;font-size:12px;color:#999;text-align:center;">
        Monje Urbano Libre — Silencio, presencia y propósito.
      </p>
    </div>
  </div>
`;

/** Aviso interno: le llega al admin cuando se confirma el pago de un pedido. */
export function emailAvisoAdmin(compra: CompraParaEmail): { subject: string; html: string } {
  const titulo = SERVICIO_TITULOS[compra.servicio] ?? compra.servicio;
  const comprador = [compra.comprador_nombre, compra.comprador_apellido].filter(Boolean).join(" ") || "—";
  const monto = compra.monto != null ? `${compra.moneda} ${compra.monto.toLocaleString("es-AR")}` : "—";

  return {
    subject: `Pedido #${compra.numero} pagado — ${titulo}`,
    html: ENVOLTORIO(`
      <h2 style="margin:0 0 20px;">Nuevo pedido pagado</h2>
      <p><strong>Pedido:</strong> #${compra.numero}</p>
      <p><strong>Servicio:</strong> ${titulo}${compra.es_regalo ? " (regalo)" : ""}</p>
      <p><strong>Monto:</strong> ${monto}</p>
      <p><strong>Comprador/a:</strong> ${comprador}${compra.comprador_email ? ` — ${compra.comprador_email}` : ""}</p>
      ${
        compra.es_regalo
          ? `<p><strong>Destinatario/a:</strong> ${compra.destinatario_nombre ?? "—"} — ${compra.destinatario_email ?? "—"}</p>
             <p>Ya le mandamos el link para completar su formulario.</p>`
          : `<p>El formulario ya está completo, listo para trabajar.</p>`
      }
      <p style="margin-top:24px;">
        <a href="${SITE_URL}/admin" style="color:#111;">Ver en el panel de administración →</a>
      </p>
    `),
  };
}

/** Le llega a quien compró (regalo o no), agradeciendo y confirmando los próximos pasos. */
export function emailGraciasComprador(compra: CompraParaEmail): { subject: string; html: string } {
  const titulo = SERVICIO_TITULOS[compra.servicio] ?? compra.servicio;

  return {
    subject: `¡Gracias por tu ${compra.es_regalo ? "regalo" : "compra"}!`,
    html: ENVOLTORIO(`
      <h2 style="margin:0 0 20px;">¡Gracias por tu confianza!</h2>
      ${
        compra.es_regalo
          ? `<p>Recibimos tu pago de <strong>${titulo}</strong>. Ya le avisamos a
             ${compra.destinatario_nombre ?? "quien lo recibe"} por mail para que complete su
             formulario sin tener que pagar nada.</p>`
          : `<p>Recibimos tu pago de <strong>${titulo}</strong>. Ya está todo listo de tu lado —
             me pongo en marcha y te contacto para los próximos pasos.</p>`
      }
      <p style="margin-top:24px;font-family:Georgia,serif;color:#555;">Silencio, presencia y propósito.</p>
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
      <h2 style="margin:0 0 20px;">Te regalaron ${titulo}</h2>
      <p>
        ${regalador ? `${regalador} pensó en vos.` : "Alguien pensó en vos."}
        Ya está todo pago — solo falta que completes tu historia para que empecemos.
      </p>
      <p style="text-align:center;margin:32px 0;">
        <a href="${link}" style="background:#111;color:#fff;padding:14px 28px;border-radius:4px;text-decoration:none;display:inline-block;">
          Completar mi formulario
        </a>
      </p>
      <p style="font-size:13px;color:#666;">Si el botón no funciona, copiá y pegá este link en tu navegador:<br>${link}</p>
    `),
  };
}
