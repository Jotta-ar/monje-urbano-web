import { getPrecio, formatPrecio } from "@/lib/prices";
import { getMonedaVisitante } from "@/lib/moneda";

export default async function PriceTag({
  ids,
  labels,
}: {
  ids: string[];
  labels: string[];
}) {
  const [precios, moneda] = await Promise.all([
    Promise.all(ids.map((id) => getPrecio(id))),
    getMonedaVisitante(),
  ]);

  return (
    <p className="price-tag" style={{ display: "block", width: "fit-content", margin: "0 auto 18px" }}>
      {precios
        .map((p, i) => `${labels[i]}: ${formatPrecio(p, moneda)}`)
        .join(" · ")}
    </p>
  );
}
