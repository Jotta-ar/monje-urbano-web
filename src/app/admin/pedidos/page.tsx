import { redirect } from "next/navigation";

// Pedidos y Precios ahora viven juntos en /admin como pestañas.
export default function PedidosRedirect() {
  redirect("/admin");
}
