import { getPrecio, formatPrecio } from "@/lib/prices";

export default async function PriceTag({
  ids,
  labels,
}: {
  ids: string[];
  labels: string[];
}) {
  const precios = await Promise.all(ids.map((id) => getPrecio(id)));

  return (
    <p className="price-tag" style={{ display: "block", width: "fit-content", margin: "0 auto 18px" }}>
      {precios
        .map((p, i) => `${labels[i]}: ${formatPrecio(p)}`)
        .join(" · ")}
    </p>
  );
}
