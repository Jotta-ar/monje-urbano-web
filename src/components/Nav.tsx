"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const LINKS = [
  { href: "/#inicio", label: "Inicio" },
  { href: "/#servicios", label: "Servicios" },
  { href: "/#productos", label: "Productos" },
  { href: "/#manifiesto", label: "Manifiesto" },
  { href: "/semillas-del-camino", label: "Semillas del Camino" },
  { href: "/#novedades", label: "Novedades" },
  { href: "/#contacto", label: "Redes" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav>
      <div className="container">
        <Link href="/#inicio" className="nav-logo">
          <Image
            src="/logos/logo-completo-blanco.png"
            alt="Monje Urbano Libre"
            width={220}
            height={55}
            className="nav-logo-img"
            style={{ width: "auto", height: "55px" }}
            priority
          />
        </Link>
        <button
          className="nav-toggle"
          onClick={() => setOpen((o) => !o)}
          aria-label="Abrir menú"
        >
          ☰
        </button>
        <ul className={`nav-links ${open ? "open" : ""}`}>
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
