const SERVICIO_SLUGS: Record<string, string> = {
  manifiesto: "Manifiesto-Personalizado",
  manifiesto_descarga_gratuita: "Manifiesto-Descarga",
  cartografia: "Cartografia-del-Sintoma",
  magia_sanadora: "Magia-Sanadora",
  ritual_matutino: "Ritual-Matutino",
};

function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // saca acentos (tildes quedan como marca combinante tras NFD)
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Formato pedido por el cliente: 001001-Servicio-2026-07-04.pdf
 * El número es global (no por servicio) y viene de compras_numero_seq.
 */
export function nombreArchivoPedido(pedido: {
  numero: number;
  servicio: string;
  creado_en: string;
}): string {
  const numero = String(pedido.numero).padStart(6, "0");
  const servicio = SERVICIO_SLUGS[pedido.servicio] ?? slugify(pedido.servicio);
  const fecha = pedido.creado_en.slice(0, 10); // YYYY-MM-DD
  return `${numero}-${servicio}-${fecha}.pdf`;
}
