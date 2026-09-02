// Matemática pura de afinação (frequência -> nota) usada pelo modo "Cantar junto" da Academy.
// Não depende de browser/React, e não reaproveita PitchLetter de notation-abc.ts: aquele é o
// alfabeto de serialização ABC (C-B) usado pelo editor do professor, este é o vocabulário de
// exibição pro aluno (nomes em PT-BR) — resolvem problemas diferentes.

export const PITCH_CLASS_NAMES_PT = [
  "Dó",
  "Dó♯",
  "Ré",
  "Ré♯",
  "Mi",
  "Fá",
  "Fá♯",
  "Sol",
  "Sol♯",
  "Lá",
  "Lá♯",
  "Si",
] as const;

export function frequencyToMidi(frequencyHz: number): number {
  return 69 + 12 * Math.log2(frequencyHz / 440);
}

export function midiToPitchClass(midi: number): number {
  const rounded = Math.round(midi);
  return ((rounded % 12) + 12) % 12;
}

export function midiToOctave(midi: number): number {
  return Math.floor(Math.round(midi) / 12) - 1;
}

export function pitchClassNamePt(pitchClass: number): string {
  return PITCH_CLASS_NAMES_PT[((pitchClass % 12) + 12) % 12];
}

export function describeOctaveOffset(sungMidi: number, expectedMidi: number): string {
  const offset = midiToOctave(sungMidi) - midiToOctave(expectedMidi);
  if (offset === 0) return "mesma oitava do escrito";
  const direction = offset > 0 ? "acima" : "abaixo";
  const count = Math.abs(offset);
  return count === 1 ? `uma oitava ${direction} do escrito` : `${count} oitavas ${direction} do escrito`;
}
