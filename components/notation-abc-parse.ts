import { parseOnly } from "abcjs";
import type {
  Accidental,
  KeySignature,
  NotationComposition,
  NotationToken,
  NotationVoice,
  NoteDuration,
  PitchLetter,
  TimeSignature,
} from "./notation-abc";

// ABC -> NotationComposition: o caminho de volta do compositionToAbc (notation-abc.ts), pra dar
// ao NotationEditor um painel de texto bidirecional e um "colar ABC" (docs/academy-recursos-
// musicais.md #1). Usa o parser do próprio abcjs (parseOnly, sem DOM) e mapeia a saída pro modelo
// de tokens do editor. É best-effort pra ABC "de fora": acorde vira só a nota mais grave, durações
// exóticas encostam na figura mais próxima, tom/compasso fora do catálogo do editor caem no padrão
// (com aviso). O round-trip do que o editor gera é exato (ver notation-abc-parse.test.ts).

const PITCH_LETTERS: PitchLetter[] = ["C", "D", "E", "F", "G", "A", "B"];

const TIME_SIGNATURES: TimeSignature[] = ["2/4", "3/4", "4/4", "6/8", "3/8", "9/8", "12/8"];

const KEY_SIGNATURES: KeySignature[] = [
  "C", "G", "D", "A", "E", "B", "F#", "Db", "Ab", "Eb", "Bb", "F",
  "Am", "Em", "Bm", "F#m", "C#m", "G#m", "D#m", "Bbm", "Fm", "Cm", "Gm", "Dm",
];

// Duração em fração de semibreve (com L:1/8, "C" = 0.125, "C2" = 0.25, ...). Figura pontuada =
// 1,5× (mínima pontuada 0.75, semínima pontuada 0.375, colcheia pontuada 0.1875) — o abcjs devolve
// esse valor exato pra "A3", "A6", "A3/2".
const DURATION_BY_FRACTION: { fraction: number; duration: NoteDuration }[] = [
  { fraction: 1, duration: "whole" },
  { fraction: 0.75, duration: "dotted-half" },
  { fraction: 0.5, duration: "half" },
  { fraction: 0.375, duration: "dotted-quarter" },
  { fraction: 0.25, duration: "quarter" },
  { fraction: 0.1875, duration: "dotted-eighth" },
  { fraction: 0.125, duration: "eighth" },
  { fraction: 0.0625, duration: "sixteenth" },
];

function nearestDuration(fraction: number): NoteDuration {
  let best: NoteDuration = "quarter";
  let bestDelta = Number.POSITIVE_INFINITY;
  for (const candidate of DURATION_BY_FRACTION) {
    const delta = Math.abs(candidate.fraction - fraction);
    if (delta < bestDelta) {
      bestDelta = delta;
      best = candidate.duration;
    }
  }
  return best;
}

function mapAccidental(value: string | undefined): Accidental | null {
  return value === "sharp" || value === "flat" || value === "natural" ? value : null;
}

export type ParseAbcResult = { composition: NotationComposition; warnings: string[] } | { error: string };

type AbcPitch = {
  pitch: number;
  accidental?: string;
  startTie?: unknown;
  startSlur?: unknown;
  endSlur?: unknown;
};
type AbcElement = {
  el_type?: string;
  rest?: unknown;
  duration?: number;
  pitches?: AbcPitch[];
  decoration?: string[];
  chord?: { name: string; position?: string }[];
};
type AbcStaff = { voices?: AbcElement[][]; title?: string[] };

// Um voice de elementos abcjs -> tokens do editor. `showNoteNames`/`droppedChordNotes` são
// devolvidos pra quem chama juntar os avisos de todas as vozes.
function elementsToTokens(elements: AbcElement[]): {
  tokens: NotationToken[];
  showNoteNames: boolean;
  droppedChordNotes: boolean;
} {
  const tokens: NotationToken[] = [];
  let showNoteNames = false;
  let droppedChordNotes = false;

  for (const element of elements) {
    if (element.el_type === "bar") {
      tokens.push({ type: "bar" });
      continue;
    }
    if (element.el_type !== "note") continue;

    const duration = nearestDuration(element.duration ?? 0.25);

    if (element.rest) {
      tokens.push({ type: "rest", duration });
      continue;
    }

    const first = element.pitches?.[0];
    if (!first) continue;
    if ((element.pitches?.length ?? 0) > 1) droppedChordNotes = true;

    const pitchClass = ((first.pitch % 7) + 7) % 7;
    const octave = 4 + Math.floor(first.pitch / 7);

    const decorations = new Set(element.decoration ?? []);
    const chordSymbol = (element.chord ?? []).find((entry) => entry.position === "default")?.name ?? null;
    if ((element.chord ?? []).some((entry) => entry.position && entry.position !== "default")) {
      showNoteNames = true;
    }

    tokens.push({
      type: "note",
      pitch: PITCH_LETTERS[pitchClass],
      octave: Math.min(7, Math.max(1, octave)),
      accidental: mapAccidental(first.accidental),
      duration,
      staccato: decorations.has("staccato"),
      accent: decorations.has("accent"),
      fermata: decorations.has("fermata"),
      tied: Boolean(first.startTie),
      crescendo: decorations.has("crescendo(") ? "start" : decorations.has("crescendo)") ? "end" : null,
      slur: first.startSlur ? "start" : first.endSlur ? "end" : null,
      chord: chordSymbol,
    });
  }

  return { tokens, showNoteNames, droppedChordNotes };
}

export function parseAbcToComposition(abc: string): ParseAbcResult {
  const trimmed = abc.trim();
  if (trimmed.length === 0) {
    return { error: "Cole ou digite uma notação ABC." };
  }

  let tunes: { lines?: { staff?: AbcStaff[] }[]; getBpm?: () => number }[] | undefined;
  try {
    tunes = parseOnly(trimmed.includes("X:") ? trimmed : `X:1\nK:C\n${trimmed}`) as typeof tunes;
  } catch {
    return { error: "Não consegui interpretar essa notação ABC." };
  }

  const tune = tunes?.[0];
  // O abcjs põe cada V: numa pauta própria; a primeira voz de cada pauta é uma voz da composição.
  const staves = tune?.lines?.find((line) => line.staff)?.staff ?? [];
  const voiceElements = staves.map((staff) => staff.voices?.[0]).filter((voice): voice is AbcElement[] => Array.isArray(voice));
  if (!tune || voiceElements.length === 0) {
    return { error: "Não encontrei nenhuma nota nessa notação." };
  }

  const warnings: string[] = [];

  const rawTimeMatch = trimmed.match(/^M:\s*(.+)$/m);
  const rawTime = rawTimeMatch?.[1]?.trim() === "C" ? "4/4" : rawTimeMatch?.[1]?.trim();
  const timeSignature: TimeSignature = (TIME_SIGNATURES as string[]).includes(rawTime ?? "")
    ? (rawTime as TimeSignature)
    : "4/4";
  if (rawTime && timeSignature !== rawTime) {
    warnings.push(`Compasso "${rawTime}" não é suportado pelo editor; usei 4/4.`);
  }

  const rawKeyMatch = trimmed.match(/^K:\s*([A-Ga-g][#b]?m?)/m);
  const rawKey = rawKeyMatch?.[1];
  const key: KeySignature = (KEY_SIGNATURES as string[]).includes(rawKey ?? "") ? (rawKey as KeySignature) : "C";
  if (rawKey && key !== rawKey) {
    warnings.push(`Tonalidade "${rawKey}" não é suportada pelo editor; usei Dó maior.`);
  }

  const bpm = typeof tune.getBpm === "function" && tune.getBpm() ? Math.round(tune.getBpm()) : 90;

  const parsedVoices = voiceElements.map((elements) => elementsToTokens(elements));
  const showNoteNames = parsedVoices.some((parsed) => parsed.showNoteNames);
  if (parsedVoices.some((parsed) => parsed.droppedChordNotes)) {
    warnings.push("Encontrei acordes; o editor guardou só a nota mais grave de cada um.");
  }

  const noteCount = parsedVoices.reduce(
    (sum, parsed) => sum + parsed.tokens.filter((token) => token.type === "note").length,
    0,
  );
  if (noteCount === 0) {
    return { error: "Não encontrei nenhuma nota nessa notação." };
  }

  const staffTitles = staves.map((staff) => staff.title?.[0]);
  const extraVoices: NotationVoice[] = parsedVoices.slice(1).map((parsed, index) => {
    const name = staffTitles[index + 1];
    return name ? { name, tokens: parsed.tokens } : { tokens: parsed.tokens };
  });

  // `w:` verbatim — reconstituir a linha a partir das sílabas por nota do abcjs seria impreciso;
  // a string original já é o que o serializador re-emite.
  const lyrics = [...trimmed.matchAll(/^w:[ \t]*(.+)$/gm)].map((match) => match[1].trim()).filter((verse) => verse.length > 0);

  return {
    composition: {
      tokens: parsedVoices[0].tokens,
      key,
      timeSignature,
      bpm,
      showNoteNames,
      lyrics: lyrics.length > 0 ? lyrics : undefined,
      voices: extraVoices.length > 0 ? extraVoices : undefined,
    },
    warnings,
  };
}
