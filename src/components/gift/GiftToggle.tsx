"use client";

import { useGiftMode } from "./GiftModeContext";

export default function GiftToggle() {
  const { mode, setMode } = useGiftMode();

  return (
    <div className="destino-toggle">
      <button
        type="button"
        className={`destino-option ${mode === "vos" ? "selected" : ""}`}
        onClick={() => setMode("vos")}
      >
        <strong>Para vos mismo/a</strong>
        <span>Completá el formulario con tus datos</span>
      </button>
      <button
        type="button"
        className={`destino-option ${mode === "regalar" ? "selected" : ""}`}
        onClick={() => setMode("regalar")}
      >
        <strong>Para regalar</strong>
        <span>Pagás vos, completa el formulario quien lo recibe</span>
      </button>
    </div>
  );
}
