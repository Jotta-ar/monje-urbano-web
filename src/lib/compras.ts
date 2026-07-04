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
 * Creates the pending order row using the public anon key. `token` always
 * comes back null here on purpose: anon has INSERT-only access to compras
 * (no SELECT), by design, so nobody can list or read back other people's
 * orders with the public key — the token/link for the gift flow gets
 * generated and sent server-side later (once the email automation is wired
 * up), not exposed to the buyer's browser. Callers should only check
 * `error`.
 */
export async function crearCompra(
  input: NuevaCompra
): Promise<{ token: string | null; error: string | null }> {
  if (!supabase) return { token: null, error: null };

  try {
    const { error } = await supabase.from("compras").insert({
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
      return { token: null, error: error.message };
    }
    return { token: null, error: null };
  } catch (err) {
    // Un fetch que revienta (red caída, timeout, etc.) tira una excepción en
    // vez de devolver { error } — sin este catch, quien llama a crearCompra
    // se queda esperando para siempre porque nunca vuelve una respuesta.
    console.error("crearCompra threw:", err);
    return { token: null, error: "Fallo de conexión al crear el pedido" };
  }
}
