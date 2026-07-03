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
import ManifiestoFields from "@/components/forms/ManifiestoFields";

export default function PedirManifiestoPage() {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="form-plain">
      <div className="form-header">
        <Link href="/#manifiesto-personalizado" className="back">← Volver al inicio</Link>
        <h1>Pedir Manifiesto Personalizado</h1>
        <p>Un ritual para volver a vos</p>
      </div>

      <GiftModeProvider>
        <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
          <GiftToggle />

          <ContentFields>
            <h2>Tu información</h2>
            <p className="section-hint">
              Este manifiesto nace a partir de tu historia. Cuanto más sinceras y sentidas
              sean tus respuestas, más profunda será la guía que recibirás.
            </p>
            <PersonalDataFields />
            <ManifiestoFields />
            <ComoSupisteField />
          </ContentFields>

          <GiftRecipientBlock />

          <OrderSubmitSection
            servicio="manifiesto"
            getForm={() => formRef.current}
          />
        </form>
      </GiftModeProvider>

      <div style={{ textAlign: "center", margin: "0 0 48px" }}>
        <Link href="/consultas?servicio=Manifiesto+Personalizado" className="btn-secondary">
          Consultar antes de pedir
        </Link>
      </div>
    </div>
  );
}
