import Image from "next/image";

/**
 * Fixed, centered, low-opacity sacred symbol behind all content.
 * position: fixed keeps it pinned to the viewport (not the page) while scrolling.
 */
export default function Watermark() {
  return (
    <div className="sacred-watermark" aria-hidden="true">
      <Image
        src="/logos/simbolo-blanco.png"
        alt=""
        width={620}
        height={1400}
        priority
      />
    </div>
  );
}
