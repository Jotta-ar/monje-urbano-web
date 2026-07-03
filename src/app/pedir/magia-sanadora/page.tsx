"use client";

import { useRef } from "react";
import Link from "next/link";
import { GiftModeProvider } from "@/components/gift/GiftModeContext";
import GiftToggle from "@/components/gift/GiftToggle";
import ContentFields from "@/components/gift/ContentFields";
import GiftRecipientBlock from "@/components/gift/GiftRecipientBlock";
import OrderSubmitSection from "@/components/gift/OrderSubmitSection";
import PersonalDataFields from "@/components/forms/PersonalDataFields";
import ComoSupisteField from "@/components/forms/ComoSupisteField";
import MagiaSanadoraFields from "@/components/forms/MagiaSanadoraFields";

export default function PedirMagiaSanadoraPage() {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="form-plain">
      <div className="form-header">
        <Link href="/#magia-sanadora" className="back">← Volver al inicio</Link>
        <h1>Pedir Magia Sanadora</h1>
        <p>Camino invisible, efecto evidente.</p>
      </div>

      <GiftModeProvider>
        <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
          <GiftToggle />

          <ContentFields>
            <h2>Datos personales</h2>
            <p className="section-hint">Todos los campos son obligatorios salvo la foto.</p>
            <PersonalDataFields />
            <MagiaSanadoraFields />
            <ComoSupisteField />
          </ContentFields>

          <GiftRecipientBlock />

          <OrderSubmitSection servicio="magia_sanadora" modalidadField="serie" getForm={() => formRef.current} />
        </form>
      </GiftModeProvider>

      <div style={{ textAlign: "center", margin: "0 0 48px" }}>
        <Link href="/consultas?servicio=Magia+Sanadora" className="btn-secondary">
          Consultar antes de pedir
        </Link>
      </div>
    </div>
  );
}
