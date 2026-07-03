export type MoonPhase = "Nueva" | "Creciente" | "Llena" | "Menguante";

export interface Sincronario {
  dia: number;
  luna: number;
  fase: MoonPhase;
}

/** Mirrors the original site's 13-lunas sincronario + real lunar phase calc. */
export function getSincronario(now = new Date()): Sincronario {
  const start = Date.UTC(2025, 6, 26);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const total = 364;
  const diff = Math.floor((today - start) / 86400000);
  const day = (((diff % total) + total) % total);
  const luna = Math.floor(day / 28) + 1;
  const dia = (day % 28) + 1;

  const newMoonRef = Date.UTC(2026, 0, 7, 0, 24);
  let lunarDay = ((today - newMoonRef) / 86400000) % 29.53059;
  if (lunarDay < 0) lunarDay += 29.53059;

  const fase: MoonPhase =
    lunarDay < 1.85
      ? "Nueva"
      : lunarDay < 7.38
      ? "Creciente"
      : lunarDay < 14.76
      ? "Llena"
      : lunarDay < 22.15
      ? "Menguante"
      : lunarDay < 28.5
      ? "Menguante"
      : "Nueva";

  return { dia, luna, fase };
}
