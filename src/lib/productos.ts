/**
 * Copy fija de confirmación post-pago para los productos físicos (Talismán,
 * Porta Sahumerio) — la misma se usa en la pantalla de "gracias" y en el
 * mail de confirmación, para no mantener el texto por duplicado en dos
 * lugares. No lleva "server-only" porque la pantalla la importa desde un
 * componente cliente.
 */
export const PRODUCTO_MENSAJES: Record<string, { titulo: string; subtitulo: string; cuerpo: string }> = {
  talisman: {
    titulo: "Talismán del Monje",
    subtitulo: "Tu orden del Talismán fue recibida",
    cuerpo:
      "Gracias por confiar en Monje Urbano Libre.\n\n" +
      "Tu compra quedó registrada correctamente. Voy a preparar la pieza con cuidado, respetando " +
      "el sentido simbólico del Talismán y la intención que acompaña este objeto.\n\n" +
      "Cuando esté lista para entrega o envío, te voy a avisar por WhatsApp o correo.",
  },
  porta_sahumerio: {
    titulo: "Porta Sahumerios Invertido",
    subtitulo: "Tu orden del Porta Sahumerios fue recibida",
    cuerpo:
      "Gracias por confiar en Monje Urbano Libre.\n\n" +
      "Tu compra quedó registrada correctamente. Voy a preparar el pedido con cuidado para que " +
      "llegue en condiciones y pueda acompañar tus momentos de pausa, limpieza y ritual.\n\n" +
      "Cuando esté listo para entrega o envío, te voy a avisar por WhatsApp o correo.",
  },
};
