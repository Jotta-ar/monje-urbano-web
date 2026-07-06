import { supabase } from "@/lib/supabase";

export type Moneda = "ARS" | "USD";

export interface NuevaCompra {
  servicio: string;
  modalidad?: string;
  esRegalo: boolean;
  datos?: Record<string, unknown>;
  compradorNombre?: string;
  compradorApellido?: string;
  compradorEmail?: string;
  compradorWhatsapp?: string;
  destinatarioEmail?: string;
  destinatarioNombre?: string;
  destinatarioApellido?: string;
  comoSupiste?: string;
  moneda: Moneda;
  monto?: number;
}

/**
 * Creates the pending order row using the public anon key. The row's id is
 * generated CLIENT-SIDE (crypto.randomUUID()) and sent explicitly in the
 * insert, instead of relying on the database default — anon has INSERT-only
 * access to compras (no SELECT), by design, so we can't read the row back
 * to get its id afterwards. This id is what we hand to Mercado Pago as the
 * `external_reference`, so the payment webhook can find the right order
 * later without needing SELECT access either.
 */
export async function crearCompra(
  input: NuevaCompra
): Promise<{ id: string | null; error: string | null }> {
  if (!supabase) return { id: null, error: null };

  const id = crypto.randomUUID();

  try {
    const { error } = await supabase.from("compras").insert({
      id,
      servicio: input.servicio,
      modalidad: input.modalidad,
      es_regalo: input.esRegalo,
      estado: "pendiente_pago",
      comprador_nombre: input.compradorNombre,
      comprador_apellido: input.compradorApellido,
      comprador_email: input.compradorEmail,
      comprador_whatsapp: input.compradorWhatsapp,
      destinatario_email: input.destinatarioEmail,
      destinatario_nombre: input.destinatarioNombre,
      destinatario_apellido: input.destinatarioApellido,
      datos: input.datos ?? null,
      como_supiste: input.comoSupiste,
      moneda: input.moneda,
      monto: input.monto,
    });

    if (error) {
      console.error("crearCompra insert failed:", error);
      return { id: null, error: error.message };
    }
    return { id, error: null };
  } catch (err) {
    // Un fetch que revienta (red caída, timeout, etc.) tira una excepción en
    // vez de devolver { error } — sin este catch, quien llama a crearCompra
    // se queda esperando para siempre porque nunca vuelve una respuesta.
    console.error("crearCompra threw:", err);
    return { id: null, error: "Fallo de conexión al crear el pedido" };
  }
}
