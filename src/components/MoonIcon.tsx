import type { MoonPhase } from "@/lib/lunar";

const MOON_YELLOW = "#f2d675";
const UNLIT = "#2a2a2a";

/**
 * Simple, legible moon-phase glyph in "moonlight yellow": full disc for Llena,
 * unlit ring for Nueva, and half-lit discs (right/left) for Creciente/Menguante.
 */
export default function MoonIcon({
  phase,
  size = 22,
  className,
}: {
  phase: MoonPhase;
  size?: number;
  className?: string;
}) {
  const r = 18;
  const c = 20;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={className}
      aria-label={`Fase lunar: ${phase}`}
      role="img"
    >
      <circle cx={c} cy={c} r={r} fill={UNLIT} stroke="rgba(242,214,117,0.35)" strokeWidth="1" />
      {phase === "Llena" && <circle cx={c} cy={c} r={r} fill={MOON_YELLOW} />}
      {phase === "Creciente" && (
        <path d={`M${c},${c - r} A${r},${r} 0 0 1 ${c},${c + r} Z`} fill={MOON_YELLOW} />
      )}
      {phase === "Menguante" && (
        <path d={`M${c},${c - r} A${r},${r} 0 0 0 ${c},${c + r} Z`} fill={MOON_YELLOW} />
      )}
      {phase === "Nueva" && (
        <circle cx={c} cy={c} r={r} fill="none" stroke={MOON_YELLOW} strokeWidth="1.5" strokeOpacity="0.6" />
      )}
    </svg>
  );
}
