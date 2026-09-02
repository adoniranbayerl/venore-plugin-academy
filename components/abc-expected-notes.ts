import { TimingCallbacks, type TuneObject } from "abcjs";
import { midiToPitchClass } from "../shared/music";
import type { NotationToken } from "./notation-abc";

// Deriva a sequência de notas esperadas (pitch + tempo + elementos SVG pra destacar) a partir de
// um TuneObject já renderizado (renderAbc, não parseOnly — só um render de verdade popula os
// elementos SVG usados depois pra colorir a nota). Usado pelo modo "Cantar junto".
//
// Mora dentro do plugin Academy (não em src/lib) porque precisa do tipo NotationToken pra fundir
// notas ligadas por tie — um arquivo "compartilhado" importando tipo de plugin específico seria
// dependência invertida.

const FALLBACK_LAST_NOTE_MS = 600;

export type ExpectedNote = {
  index: number;
  midiPitch: number;
  pitchClass: number;
  startMs: number;
  durationMs: number;
  elements: HTMLElement[];
};

export function extractExpectedNotes(
  tuneObject: TuneObject,
  opts?: { qpm?: number; tokens?: NotationToken[] },
): { notes: ExpectedNote[]; totalMs: number; rawIndexToNoteIndex: number[] } {
  const timing = new TimingCallbacks(tuneObject, { qpm: opts?.qpm });
  const noteEvents = timing.noteTimings.filter(
    (event) => event.type === "event" && event.midiPitches && event.midiPitches.length > 0,
  );

  const rawNotes: ExpectedNote[] = [];
  let lastDurationMs = FALLBACK_LAST_NOTE_MS;
  for (let index = 0; index < noteEvents.length; index++) {
    const event = noteEvents[index];
    const nextStartMs = noteEvents[index + 1]?.milliseconds;
    const durationMs = nextStartMs !== undefined ? nextStartMs - event.milliseconds : lastDurationMs;
    lastDurationMs = durationMs;
    const midiPitch = event.midiPitches![0].pitch;
    rawNotes.push({
      index,
      midiPitch,
      pitchClass: midiToPitchClass(midiPitch),
      startMs: event.milliseconds,
      durationMs,
      elements: (event.elements ?? []).flat(),
    });
  }

  const totalMs = timing.noteTimings.at(-1)?.milliseconds ?? 0;

  // abcjs não funde nota ligada por tie na visão de tempo (TimingCallbacks) — cada nota ligada
  // sempre vira dois eventos brutos, mesmo já sendo tocada como uma só no MIDI. Fundimos aqui, do
  // nosso lado, usando os tokens originais (única fonte confiável de "isso está ligado") — só
  // funciona quando `tokens` é passado e bate em quantidade com os eventos brutos; caso contrário
  // cai no comportamento sem fusão (rawIndexToNoteIndex vira identidade), nunca quebra.
  const noteTokens = opts?.tokens?.filter((token): token is Extract<NotationToken, { type: "note" }> => token.type === "note");
  const canMerge = !!noteTokens && noteTokens.length === rawNotes.length;

  const groups: number[][] = [];
  let currentGroup: number[] = rawNotes.length > 0 ? [0] : [];
  for (let i = 1; i < rawNotes.length; i++) {
    const continuesTie =
      canMerge && noteTokens![i - 1].tied === true && rawNotes[i].midiPitch === rawNotes[i - 1].midiPitch;
    if (continuesTie) {
      currentGroup.push(i);
    } else {
      groups.push(currentGroup);
      currentGroup = [i];
    }
  }
  if (currentGroup.length > 0) groups.push(currentGroup);

  const notes: ExpectedNote[] = groups.map((group, mergedIndex) => {
    const first = rawNotes[group[0]];
    const durationMs = group.reduce((sum, rawIdx) => sum + rawNotes[rawIdx].durationMs, 0);
    const elements = group.flatMap((rawIdx) => rawNotes[rawIdx].elements);
    return { ...first, index: mergedIndex, durationMs, elements };
  });

  const rawIndexToNoteIndex: number[] = [];
  groups.forEach((group, mergedIndex) => {
    group.forEach((rawIdx) => {
      rawIndexToNoteIndex[rawIdx] = mergedIndex;
    });
  });

  return { notes, totalMs, rawIndexToNoteIndex };
}
