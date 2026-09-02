// Entrada de notação pelo teclado do computador (docs/academy-recursos-musicais.md, #1 — "escrita
// de partitura mais fluida"). Funções puras, separadas do NotationEditor pra serem testadas sem
// React/abcjs: o componente só chama resolveTypedNote / lê os mapas de tecla e aplica o resultado
// pelos mesmos commitTokens que o teclado de piano já usa.

import { noteToMidi, type Accidental, type NoteDuration, type PitchLetter } from "./notation-abc";

// Teclas de letra -> altura. A nota Si é "b" (não colide com bemol: bemol pendente é "-", ver
// NotationEditor).
export const PITCH_KEYS: Record<string, PitchLetter> = {
  a: "A",
  b: "B",
  c: "C",
  d: "D",
  e: "E",
  f: "F",
  g: "G",
};

// Dígito -> figura. "1" é a mais longa (semibreve), como se lê "um tempo inteiro"; só as cinco
// figuras que NoteDuration conhece.
export const DURATION_KEYS: Record<string, NoteDuration> = {
  "1": "whole",
  "2": "half",
  "3": "quarter",
  "4": "eighth",
  "5": "sixteenth",
};

type PitchAndOctave = { pitch: PitchLetter; octave: number };

// Oitava que deixa a nova letra mais perto da nota anterior (menor salto absoluto em semitons),
// testando a mesma oitava e as duas vizinhas. Sem nota anterior, cai na oitava 4 (padrão do
// editor). Sem isso, digitar "c" depois de um "b" agudo cairia uma sétima abaixo em vez de subir
// um semitom.
export function nearestOctave(letter: PitchLetter, previous: PitchAndOctave | null): number {
  if (!previous) return 4;
  const target = noteToMidi(previous.pitch, previous.octave, null);
  let best = previous.octave;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const octave of [previous.octave - 1, previous.octave, previous.octave + 1]) {
    const distance = Math.abs(noteToMidi(letter, octave, null) - target);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = octave;
    }
  }
  return best;
}

export type TypedNote = { pitch: PitchLetter; octave: number; accidental: Accidental | null };

// Resolve a tecla de letra numa nota concreta: oitava mais próxima da anterior (presa ao range de
// oitavas do editor) + o acidente pendente (definido por "#" / "-" / "=" antes de digitar a
// letra).
export function resolveTypedNote(
  letter: PitchLetter,
  previous: PitchAndOctave | null,
  pendingAccidental: Accidental | null,
  octaveRange: { min: number; max: number },
): TypedNote {
  const octave = Math.min(octaveRange.max, Math.max(octaveRange.min, nearestOctave(letter, previous)));
  return { pitch: letter, octave, accidental: pendingAccidental };
}
