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
 * Creates the pending order row. Returns the generated token (used to build
 * the /completar/[token] gift link). `token` is null either because Supabase
 * isn't configured yet (site keeps working end-to-end without a backend
 * wired up — `error` stays null in that case) or because the insert actually
 * failed (`error` holds the message so the caller can show a real error
 * instead of a false "success").
 */
export async function crearCompra(
  input: NuevaCompra
): Promise<{ token: string | null; error: string | null }> {
  if (!supabase) return { token: null, error: null };

  const { data, error } = await supabase
    .from("compras")
    .insert({
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
    })
    .select("token")
    .single();

  if (error) {
    console.error("crearCompra insert failed:", error);
    return { token: null, error: error.message };
  }
  return { token: (data?.token as string) ?? null, error: null };
}
