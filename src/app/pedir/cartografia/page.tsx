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
import CartografiaFields from "@/components/forms/CartografiaFields";

export default function PedirCartografiaPage() {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="form-plain">
      <div className="form-header">
        <Link href="/#cartografia" className="back">← Volver al inicio</Link>
        <h1>Cartografía del Síntoma</h1>
        <p>Tu cuerpo habla. Yo traduzco su mensaje en una dirección clara.</p>
      </div>

      <GiftModeProvider>
        <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
          <GiftToggle />

          <ContentFields>
            <h2>Datos de contacto</h2>
            <PersonalDataFields />
            <CartografiaFields />
            <ComoSupisteField />
          </ContentFields>

          <GiftRecipientBlock />

          <OrderSubmitSection servicio="cartografia" getForm={() => formRef.current} />
        </form>
      </GiftModeProvider>

      <div style={{ textAlign: "center", margin: "0 0 48px" }}>
        <Link href="/consultas?servicio=Cartograf%C3%ADa+del+S%C3%ADntoma" className="btn-secondary">
          Consultar antes de pedir
        </Link>
      </div>
    </div>
  );
}
