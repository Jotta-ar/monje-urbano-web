import { cookies } from "next/headers";

export type Moneda = "ARS" | "USD";

/**
 * Moneda sugerida para el visitante actual, según el país detectado por IP
 * en middleware.ts (guardado en la cookie "moneda"). Usarla desde Server
 * Components para decidir qué precio mostrar por default.
 */
export async function getMonedaVisitante(): Promise<Moneda> {
  const store = await cookies();
  return store.get("moneda")?.value === "USD" ? "USD" : "ARS";
}
