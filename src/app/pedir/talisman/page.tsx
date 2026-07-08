import Link from "next/link";
import ProductOrderSection from "@/components/ProductOrderSection";

export default function PedirTalismanPage() {
  return (
    <div className="form-plain">
      <div className="form-header">
        <Link href="/#producto-talismanes" className="back">← Volver al inicio</Link>
        <h1>Talismán del Monje</h1>
        <p>Un símbolo vivo de conexión, conciencia y propósito.</p>
      </div>

      <ProductOrderSection servicio="talisman" />

      <div style={{ textAlign: "center", margin: "0 0 48px" }}>
        <Link href="/consultas?servicio=Talismanes+del+Monje" className="btn-secondary">
          Consultar antes de pedir
        </Link>
      </div>
    </div>
  );
}
