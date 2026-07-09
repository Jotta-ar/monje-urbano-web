"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * Carrusel de fotos de producto: hoy cada producto puede tener una sola
 * foto, pero está pensado para ir sumando más (`images`) sin tocar el
 * layout — con una sola imagen no muestra flechas ni puntitos.
 */
export default function ProductCarousel({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [indice, setIndice] = useState(0);

  if (images.length === 0) {
    return (
      <div className="prod-photo-frame prod-photo-placeholder" aria-hidden="true">
        <span>Foto del producto próximamente</span>
      </div>
    );
  }

  const anterior = () => setIndice((i) => (i - 1 + images.length) % images.length);
  const siguiente = () => setIndice((i) => (i + 1) % images.length);

  return (
    <div className="prod-carousel">
      <div className="prod-photo-frame">
        <Image src={images[indice]} alt={alt} fill sizes="(max-width: 768px) 280px, 320px" style={{ objectFit: "cover" }} />
        {images.length > 1 && (
          <>
            <button
              type="button"
              className="prod-carousel-arrow prod-carousel-arrow-left"
              onClick={anterior}
              aria-label="Foto anterior"
            >
              ‹
            </button>
            <button
              type="button"
              className="prod-carousel-arrow prod-carousel-arrow-right"
              onClick={siguiente}
              aria-label="Foto siguiente"
            >
              ›
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="prod-carousel-dots">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`prod-carousel-dot${i === indice ? " active" : ""}`}
              onClick={() => setIndice(i)}
              aria-label={`Ver foto ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
