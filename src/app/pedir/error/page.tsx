import Link from "next/link";

export default function PagoErrorPage() {
  return (
    <div className="form-plain">
      <div className="form-header">
        <h1>El pago no se pudo completar</h1>
        <p>No te preocupes, no se realizó ningún cobro. Podés volver a intentarlo cuando quieras.</p>
      </div>
      <div style={{ textAlign: "center" }}>
        <Link href="/" className="btn-secondary">Volver al inicio</Link>
      </div>
    </div>
  );
}
