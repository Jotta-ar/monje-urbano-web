import Link from "next/link";
import ProductOrderSection from "@/components/ProductOrderSection";

export default function PedirPortaSahumerioPage() {
  return (
    <div className="form-plain">
      <div className="form-header">
        <Link href="/#producto-porta-sahumerio" className="back">← Volver al inicio</Link>
        <h1>Porta Sahumerio Invertido</h1>
        <p>Sutil como el humo, profundo como el silencio.</p>
      </div>

      <ProductOrderSection servicio="porta_sahumerio" />

      <div style={{ textAlign: "center", margin: "0 0 48px" }}>
        <Link href="/consultas?servicio=Porta+Sahumerios+Invertidos" className="btn-secondary">
          Consultar antes de pedir
        </Link>
      </div>
    </div>
  );
}
