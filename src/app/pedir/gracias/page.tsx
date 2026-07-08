import Link from "next/link";
import { PRODUCTO_MENSAJES } from "@/lib/productos";

export default async function PagoGraciasPage({
  searchParams,
}: {
  searchParams: Promise<{ servicio?: string }>;
}) {
  const { servicio } = await searchParams;
  const producto = servicio ? PRODUCTO_MENSAJES[servicio] : undefined;

  if (producto) {
    return (
      <div className="form-plain">
        <div className="form-header">
          <h1>{producto.subtitulo}</h1>
        </div>
        {producto.cuerpo.split("\n\n").map((parrafo, i) => (
          <p key={i} style={{ textAlign: "center", color: "#ccc", maxWidth: 480, margin: "0 auto 20px" }}>
            {parrafo}
          </p>
        ))}
        <p style={{ textAlign: "center", color: "#999", fontFamily: "'Pirata One', serif", marginTop: 8 }}>
          Silencio, presencia y propósito.
        </p>
        <div style={{ textAlign: "center", marginTop: 28 }}>
          <Link href="/" className="btn-secondary">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="form-plain">
      <div className="form-header">
        <h1>¡Gracias por tu confianza!</h1>
        <p>
          Recibimos tu pago. En cuanto Mercado Pago lo confirme (a veces toma unos minutos), me
          pongo en marcha con tu pedido.
        </p>
      </div>
      <p style={{ textAlign: "center", color: "#999", maxWidth: 480, margin: "0 auto 28px" }}>
        Si el pedido era un regalo, la persona que lo recibe va a poder completar su formulario en
        cuanto el pago quede acreditado.
      </p>
      <div style={{ textAlign: "center" }}>
        <Link href="/" className="btn-secondary">Volver al inicio</Link>
      </div>
    </div>
  );
}
