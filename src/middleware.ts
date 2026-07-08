import { NextRequest, NextResponse } from "next/server";

/**
 * Vercel agrega el header x-vercel-ip-country a cada request según la IP del
 * visitante, sin costo ni configuración extra. Lo usamos para decidir la
 * moneda por default en todo el sitio (precios, botones de pago): Argentina
 * ve pesos, cualquier otro país ve dólares. En desarrollo local ese header
 * no existe, así que cae en "AR" (pesos) por default.
 */
export function middleware(request: NextRequest) {
  const pais = request.headers.get("x-vercel-ip-country") ?? "AR";
  const moneda = pais === "AR" ? "ARS" : "USD";

  const response = NextResponse.next();
  response.cookies.set("moneda", moneda, {
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next/|api/|favicon.ico|logos/|fonts/|docs/).*)"],
};
