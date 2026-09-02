import { midiToNote, type KeySignature } from "../components/notation-abc";

// Bloco "Progressão de acordes" (docs/academy-recursos-musicais.md #3): o professor digita uma
// cifra ("A D E7 A") e o aluno ouve a progressão. Este módulo é puro — transforma a lista de
// cifras num ABC tocável pelo synth do abcjs (via NotationPlayButton). Sem melodia: "ouvir só a
// melodia" já é coberto pelo bloco de partitura multi-voz.

const NOTE_SEMITONE: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

// Intervalos (em semitons a partir da fundamental) por sufixo de cifra. "" = tríade maior.
const QUALITY_INTERVALS: Record<string, number[]> = {
  "": [0, 4, 7],
  maj: [0, 4, 7],
  M: [0, 4, 7],
  m: [0, 3, 7],
  min: [0, 3, 7],
  "-": [0, 3, 7],
  "7": [0, 4, 7, 10],
  dom7: [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  M7: [0, 4, 7, 11],
  m7: [0, 3, 7, 10],
  min7: [0, 3, 7, 10],
  "-7": [0, 3, 7, 10],
  dim: [0, 3, 6],
  "°": [0, 3, 6],
  o: [0, 3, 6],
  dim7: [0, 3, 6, 9],
  "°7": [0, 3, 6, 9],
  m7b5: [0, 3, 6, 10],
  "ø": [0, 3, 6, 10],
  aug: [0, 4, 8],
  "+": [0, 4, 8],
  sus4: [0, 5, 7],
  sus: [0, 5, 7],
  sus2: [0, 2, 7],
  "6": [0, 4, 7, 9],
  m6: [0, 3, 7, 9],
  add9: [0, 4, 7, 14],
  "9": [0, 4, 7, 10, 14],
};

export type ParsedChord = { rootSemitone: number; intervals: number[]; bassSemitone: number };

export function parseChordSymbol(raw: string): ParsedChord | null {
  const match = raw.trim().match(/^([A-Ga-g])([#b]?)(.*?)(?:\/([A-Ga-g])([#b]?))?$/);
  if (!match) return null;
  const [, rootLetter, rootAcc, quality, bassLetter, bassAcc] = match;

  const accToSemitone = (acc: string) => (acc === "#" ? 1 : acc === "b" ? -1 : 0);
  const rootSemitone = (NOTE_SEMITONE[rootLetter.toUpperCase()] + accToSemitone(rootAcc) + 12) % 12;
  const intervals = QUALITY_INTERVALS[quality.trim()];
  if (!intervals) return null;

  const bassSemitone = bassLetter
    ? (NOTE_SEMITONE[bassLetter.toUpperCase()] + accToSemitone(bassAcc) + 12) % 12
    : rootSemitone;

  return { rootSemitone, intervals, bassSemitone };
}

const ACCIDENTAL_PREFIX: Record<string, string> = { sharp: "^", flat: "_", natural: "=" };

// semitom (classe de nota 0-11) + oitava -> nota ABC. A grafia (sustenido/bemol) sai do
// midiToNote do editor, pra ficar consistente com o resto.
function abcNote(semitone: number, octave: number): string {
  const { pitch, accidental } = midiToNote(60 + (((semitone % 12) + 12) % 12));
  const prefix = accidental ? ACCIDENTAL_PREFIX[accidental] : "";
  const letter =
    octave === 4
      ? pitch
      : octave < 4
        ? pitch + ",".repeat(4 - octave)
        : pitch.toLowerCase() + "'".repeat(octave - 5);
  return `${prefix}${letter}`;
}

function durationSuffix(beats: number): string {
  return beats === 1 ? "" : String(Math.max(1, Math.round(beats)));
}

// Uma cifra -> "[baixo tônica terça quinta…]<duração>". Baixo na oitava 3, resto na 4 (voicing
// fechado). Cifra que não parseia vira pausa (a progressão continua no tempo certo).
function chordToAbc(symbol: string, beats: number): string {
  const parsed = parseChordSymbol(symbol);
  if (!parsed) return `z${durationSuffix(beats)}`;
  const bass = abcNote(parsed.bassSemitone, 3);
  const tones = parsed.intervals.map((interval) => abcNote((parsed.rootSemitone + interval) % 12, 4)).join("");
  return `[${bass}${tones}]${durationSuffix(beats)}`;
}

export type ProgressionEntry = { symbol: string; beats: number };

// "A D E7:2 A:2" -> [{A,4},{D,4},{E7,2},{A,2}] (default = beatsPerChord).
export function parseProgression(input: string, beatsPerChord: number): ProgressionEntry[] {
  return input
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 0)
    .map((token) => {
      const [symbol, beatsRaw] = token.split(":");
      const beats = beatsRaw && Number.isFinite(Number(beatsRaw)) ? Math.max(1, Math.round(Number(beatsRaw))) : beatsPerChord;
      return { symbol, beats };
    });
}

export function progressionToAbc(params: {
  chords: ProgressionEntry[];
  key: KeySignature;
  bpm: number;
}): string {
  const header = `X:1\nM:4/4\nL:1/4\nQ:1/4=${params.bpm}\nK:${params.key}\n`;

  // Barra de compasso a cada 4 tempos.
  let beatsInBar = 0;
  const pieces: string[] = [];
  for (const chord of params.chords) {
    pieces.push(chordToAbc(chord.symbol, chord.beats));
    beatsInBar += chord.beats;
    if (beatsInBar >= 4) {
      pieces.push("|");
      beatsInBar = 0;
    }
  }
  const body = pieces.join(" ").replace(/\s*\|\s*$/, " |");
  return `${header}${body}\n`;
}
