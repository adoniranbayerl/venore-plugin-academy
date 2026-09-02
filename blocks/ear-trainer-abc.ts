import { midiToNote } from "../components/notation-abc";

// Treinador de ouvido (docs/academy-recursos-musicais.md #2) — puro e testável: gera o ABC de uma
// questão (dois sons) a partir de uma tônica + intervalo/acorde + direção. O bloco client toca via
// synth do abcjs e corrige na hora; nada é persistido (é prática).

export const INTERVAL_SEMITONES: Record<string, number> = {
  "2m": 1,
  "2M": 2,
  "3m": 3,
  "3M": 4,
  "4J": 5,
  trítono: 6,
  "5J": 7,
  "6m": 8,
  "6M": 9,
  "7m": 10,
  "7M": 11,
  "8J": 12,
};

export const INTERVAL_LABEL: Record<string, string> = {
  "2m": "2ª menor",
  "2M": "2ª maior",
  "3m": "3ª menor",
  "3M": "3ª maior",
  "4J": "4ª justa",
  trítono: "trítono",
  "5J": "5ª justa",
  "6m": "6ª menor",
  "6M": "6ª maior",
  "7m": "7ª menor",
  "7M": "7ª maior",
  "8J": "8ª justa",
};

// Acordes: intervalos (em semitons) empilhados a partir da fundamental.
export const CHORD_INTERVALS: Record<string, number[]> = {
  maior: [0, 4, 7],
  menor: [0, 3, 7],
  diminuto: [0, 3, 6],
  aumentado: [0, 4, 8],
  "sétima da dominante": [0, 4, 7, 10],
  "sétima maior": [0, 4, 7, 11],
};

const ACCIDENTAL_PREFIX: Record<string, string> = { sharp: "^", flat: "_", natural: "=" };

function abcFromMidi(midi: number): string {
  const { pitch, octave, accidental } = midiToNote(midi);
  const prefix = accidental ? ACCIDENTAL_PREFIX[accidental] : "";
  const letter =
    octave === 4
      ? pitch
      : octave < 4
        ? pitch + ",".repeat(4 - octave)
        : pitch.toLowerCase() + "'".repeat(octave - 5);
  return `${prefix}${letter}`;
}

export type EarQuestionKind = "interval" | "chord";
export type EarDirection = "asc" | "desc" | "harmonic";

// rootMidi geralmente 57–64 (Lá3–Mi4). Devolve o ABC tocável e nunca o rótulo da resposta.
export function earQuestionToAbc(params: {
  kind: EarQuestionKind;
  rootMidi: number;
  // intervalo: um id de INTERVAL_SEMITONES; acorde: um id de CHORD_INTERVALS.
  answer: string;
  direction: EarDirection;
  bpm?: number;
}): string {
  const bpm = params.bpm ?? 84;
  const header = `X:1\nM:4/4\nL:1/4\nQ:1/4=${bpm}\nK:C\n`;

  if (params.kind === "chord") {
    const intervals = CHORD_INTERVALS[params.answer] ?? CHORD_INTERVALS.maior;
    const notes = intervals.map((semi) => abcFromMidi(params.rootMidi + semi)).join("");
    return `${header}[${notes}]4 |\n`;
  }

  const semis = INTERVAL_SEMITONES[params.answer] ?? 4;
  const first = abcFromMidi(params.rootMidi);
  const second = abcFromMidi(params.direction === "desc" ? params.rootMidi - semis : params.rootMidi + semis);
  if (params.direction === "harmonic") {
    return `${header}[${first}${second}]4 |\n`;
  }
  return `${header}${first}2 ${second}2 |\n`;
}
