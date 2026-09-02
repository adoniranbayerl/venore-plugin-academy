"use client";

import type { PitchLetter } from "./notation-abc";

const WHITE_KEYS: PitchLetter[] = ["C", "D", "E", "F", "G", "A", "B"];

// Posição das teclas pretas em fração do vão de 7 teclas brancas de uma oitava — geometria fixa de
// teclado de piano (não existe token de espaçamento equivalente a "onde fica o Dó sustenido"), por
// isso calculada em % em vez de valor de espaçamento hardcoded.
const BLACK_KEYS: { afterWhiteIndex: number; pitch: PitchLetter }[] = [
  { afterWhiteIndex: 0, pitch: "C" }, // C♯
  { afterWhiteIndex: 1, pitch: "D" }, // D♯
  { afterWhiteIndex: 3, pitch: "F" }, // F♯
  { afterWhiteIndex: 4, pitch: "G" }, // G♯
  { afterWhiteIndex: 5, pitch: "A" }, // A♯
];

// Teclado de piano visual — substitui o grid antigo de botões "letra+número" como forma de
// escolher altura+oitava. Tecla branca = nota natural; tecla preta = sempre grafada como sustenido
// da tecla branca anterior (sem escolha de bemol/sustenido aqui — simplificação aceita ao trocar
// pra layout de piano, natural/bemol continuam disponíveis via o toggle "Natural" do NotationEditor
// pra cancelar acidente de armadura de clave).
export function PianoKeyboard({
  octaves,
  onKeyClick,
}: {
  octaves: number[];
  onKeyClick: (pitch: PitchLetter, octave: number, accidental: "sharp" | null) => void;
}) {
  return (
    <div className="-mx-1 flex gap-0.5 overflow-x-auto px-1 pb-1" role="group" aria-label="Teclado">
      {octaves.map((octave) => (
        // Largura da oitava = 7 teclas brancas de w-11 (44px, alvo de toque mínimo acessível —
        // público idoso, docs/academy-recursos-musicais.md #8). O left % das teclas pretas é
        // relativo a esta largura, então os dois precisam andar juntos.
        <div key={octave} className="relative flex w-77 shrink-0">
          {WHITE_KEYS.map((pitch) => (
            <button
              key={pitch}
              type="button"
              onClick={() => onKeyClick(pitch, octave, null)}
              className="flex h-28 w-11 shrink-0 flex-col items-center justify-end border border-border bg-card pb-1 text-sm font-medium text-foreground outline-none ui-motion-base first:rounded-l-md last:rounded-r-md hover:bg-accent/14 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`${pitch}${octave}`}
            >
              {pitch}
              {pitch === "C" && <span className="text-[10px] text-muted-foreground/56">{octave}</span>}
            </button>
          ))}
          {BLACK_KEYS.map(({ afterWhiteIndex, pitch }) => (
            <button
              key={pitch}
              type="button"
              onClick={() => onKeyClick(pitch, octave, "sharp")}
              className="absolute top-0 h-16 w-7 -translate-x-1/2 rounded-b-md bg-foreground outline-none ui-motion-base hover:bg-foreground/80 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring"
              style={{ left: `${((afterWhiteIndex + 1) / WHITE_KEYS.length) * 100}%` }}
              aria-label={`${pitch}♯${octave}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
