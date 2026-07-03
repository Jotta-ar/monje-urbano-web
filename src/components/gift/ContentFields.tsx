"use client";

import type { ReactNode } from "react";
import { useGiftMode } from "./GiftModeContext";

/**
 * Wraps every content field of a service form (personal data + the actual
 * questionnaire). When the buyer picks "Para regalar" these are entirely
 * locked — the recipient fills them later via their own link — matching the
 * client's spec: only the recipient's email stays enabled in gift mode.
 */
export default function ContentFields({ children }: { children: ReactNode }) {
  const { mode } = useGiftMode();
  const disabled = mode === "regalar";

  return (
    <fieldset
      disabled={disabled}
      className={disabled ? "form-section gift-disabled" : "form-section"}
    >
      {children}
    </fieldset>
  );
}
