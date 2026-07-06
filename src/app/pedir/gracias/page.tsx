import Link from "next/link";

export default function PagoGraciasPage() {
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
