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
import RitualMatutinoFields from "@/components/forms/RitualMatutinoFields";

export default function PedirRitualMatutinoPage() {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="form-plain">
      <div className="form-header">
        <Link href="/#ritual-matutino" className="back">← Volver al inicio</Link>
        <h1>Ritual Matutino Personalizado</h1>
        <p>Un anclaje diario para reconectar con tu verdadero centro</p>
      </div>

      <GiftModeProvider>
        <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
          <GiftToggle />

          <ContentFields>
            <h2>Datos personales</h2>
            <p className="section-hint">
              Antes de crear tu ritual matutino, necesito conocer un poco más sobre vos. No hay
              respuestas correctas: sólo verdades que hablen desde tu momento actual.
            </p>
            <PersonalDataFields />
            <RitualMatutinoFields />
            <ComoSupisteField />
          </ContentFields>

          <GiftRecipientBlock />

          <OrderSubmitSection servicio="ritual_matutino" getForm={() => formRef.current} />
        </form>
      </GiftModeProvider>

      <div style={{ textAlign: "center", margin: "0 0 48px" }}>
        <Link href="/consultas?servicio=Ritual+Matutino+Personalizado" className="btn-secondary">
          Consultar antes de pedir
        </Link>
      </div>
    </div>
  );
}
