"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type GiftMode = "vos" | "regalar";

const GiftModeContext = createContext<{
  mode: GiftMode;
  setMode: (m: GiftMode) => void;
} | null>(null);

export function GiftModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<GiftMode>("vos");
  return (
    <GiftModeContext.Provider value={{ mode, setMode }}>
      {children}
    </GiftModeContext.Provider>
  );
}

export function useGiftMode() {
  const ctx = useContext(GiftModeContext);
  if (!ctx) throw new Error("useGiftMode debe usarse dentro de <GiftModeProvider>");
  return ctx;
}
