export type MoonPhase = "Nueva" | "Creciente" | "Llena" | "Menguante";

export interface Sincronario {
  dia: number;
  luna: number;
  fase: MoonPhase;
  /** 25 de julio: no pertenece a ninguna luna, día/luna quedan en 0. */
  fueraDelTiempo: boolean;
}

const MS_DIA = 86400000;

function esBisiesto(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function calcularFase(today: number): MoonPhase {
  const newMoonRef = Date.UTC(2026, 0, 18, 19, 52); // Luna nueva real: 18 ene 2026, 19:52 UTC
  let lunarDay = ((today - newMoonRef) / MS_DIA) % 29.53059;
  if (lunarDay < 0) lunarDay += 29.53059;

  return lunarDay < 1.85
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
}

/**
 * Sincronario de 13 lunas + fase lunar real.
 *
 * El año de 13 lunas arranca el 26 de julio y tiene 364 días numerados
 * (13 lunas × 28 días). El 25 de julio siguiente es el "Día Fuera del
 * Tiempo": no es Luna 1 Día 1 ni Luna 13 Día 28, es un día aparte, fuera
 * de la cuenta — por eso acá se trata como caso especial en vez de
 * contarlo como un día más del ciclo (el bug original: al contarlo,
 * el calendario se adelantaba un día apenas se cruzaba un 25/7).
 * El 29 de febrero (bisiesto) tampoco se cuenta, por el mismo motivo,
 * para que el 26 de julio siempre caiga en Luna 1 / Día 1 sin importar
 * cuántos bisiestos pasaron.
 */
export function getSincronario(now = new Date()): Sincronario {
  const y = now.getFullYear();
  const m = now.getMonth(); // 0-indexado: 6 = julio
  const d = now.getDate();
  const today = Date.UTC(y, m, d);
  const fase = calcularFase(today);

  if (m === 6 && d === 25) {
    return { dia: 0, luna: 0, fase, fueraDelTiempo: true };
  }

  // ¿Qué año de 13 lunas es "hoy"? Arrancó el 26/7 de este año si ya pasó
  // esa fecha; si no, arrancó el 26/7 del año anterior.
  const yearInicio = m > 6 || (m === 6 && d >= 26) ? y : y - 1;
  const inicio = Date.UTC(yearInicio, 6, 26);

  let diff = Math.floor((today - inicio) / MS_DIA);
  if (esBisiesto(yearInicio + 1) && today >= Date.UTC(yearInicio + 1, 1, 29)) {
    diff -= 1;
  }

  const day = ((diff % 364) + 364) % 364;
  const luna = Math.floor(day / 28) + 1;
  const dia = (day % 28) + 1;

  return { dia, luna, fase, fueraDelTiempo: false };
}
