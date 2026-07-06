import "server-only";
import { MercadoPagoConfig } from "mercadopago";

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

/** Server-only client. Never import this from a "use client" component. */
export const mpClient = accessToken ? new MercadoPagoConfig({ accessToken }) : null;

/**
 * Maps a servicio + modalidad (as chosen in the order form) to the matching
 * row id in the `precios` table. Looked up server-side so the actual amount
 * charged always comes from our own database, never from anything the
 * browser sends — a tampered client request can't change the price.
 *
 * Returns null for combinations without a fixed, auto-charge price (e.g.
 * "intensivo" in Magia Sanadora needs a custom quote via Consultas).
 */
export function precioIdPara(servicio: string, modalidad?: string | null): string | null {
  switch (servicio) {
    case "manifiesto":
      return "manifiesto";
    case "ritual_matutino":
      return "ritual_matutino";
    case "cartografia":
      return "cartografia_pdf";
    case "magia_sanadora":
      switch (modalidad) {
        case "unica":
          return "magia_unica";
        case "serie3":
          return "magia_serie3";
        case "serie6":
          return "magia_serie6";
        case "serie9":
          return "magia_serie9";
        default:
          return null;
      }
    default:
      return null;
  }
}

export const SERVICIO_TITULOS: Record<string, string> = {
  manifiesto: "Manifiesto Personalizado",
  ritual_matutino: "Ritual Matutino Personalizado",
  cartografia: "Cartografía del Síntoma",
  magia_sanadora: "Magia Sanadora",
};
