import { supabase } from "@/lib/supabase";

export interface Precio {
  id: string;
  label: string;
  monto_ars: number | null;
  monto_usd: number | null;
}

/** Reads live prices from Supabase when configured; otherwise returns null (UI shows "a confirmar"). */
export async function getPrecio(id: string): Promise<Precio | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("precios")
    .select("id, label, monto_ars, monto_usd")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return data as Precio;
}

export function formatPrecio(precio: Precio | null, moneda: "ARS" | "USD" = "ARS") {
  if (!precio) return "A confirmar";
  const monto = moneda === "ARS" ? precio.monto_ars : precio.monto_usd;
  if (monto == null) return "A confirmar";
  return moneda === "ARS"
    ? `$${monto.toLocaleString("es-AR")} ARS`
    : `US$${monto.toLocaleString("en-US")}`;
}
