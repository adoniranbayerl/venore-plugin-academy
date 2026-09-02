"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { renderAbc, TimingCallbacks } from "abcjs";
import { Delete, RotateCcw } from "lucide-react";
import { Button } from "@venore/plugin-sdk/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@venore/plugin-sdk/ui";
import { cn } from "@venore/plugin-sdk/ui";
import { PianoKeyboard } from "./piano-keyboard";
import { DURATION_KEYS, PITCH_KEYS, resolveTypedNote } from "./notation-keyboard";
import { parseAbcToComposition } from "./notation-abc-parse";
import {
  canDot,
  compositionToAbcWithRanges,
  midiToNote,
  notePitchNamePt,
  noteToMidi,
  withDot,
  type Accidental,
  type KeySignature,
  type NotationComposition,
  type NotationToken,
  type NotationVoice,
  type NoteDuration,
  type PitchLetter,
  type TimeSignature,
} from "./notation-abc";

const DURATIONS: { value: NoteDuration; label: string }[] = [
  { value: "sixteenth", label: "𝅘𝅥𝅯" },
  { value: "eighth", label: "♪" },
  { value: "quarter", label: "♩" },
  { value: "half", label: "𝅗𝅥" },
  { value: "whole", label: "𝅝" },
];

const MIN_BPM = 40;
const MAX_BPM = 208;

const PIANO_OCTAVES = [2, 3, 4, 5, 6];

const TIME_SIGNATURES: TimeSignature[] = ["2/4", "3/4", "4/4", "6/8", "3/8", "9/8", "12/8"];

const KEY_LABELS: Record<KeySignature, string> = {
  C: "Dó maior",
  G: "Sol maior",
  D: "Ré maior",
  A: "Lá maior",
  E: "Mi maior",
  B: "Si maior",
  "F#": "Fá♯ maior",
  Db: "Ré♭ maior",
  Ab: "Lá♭ maior",
  Eb: "Mi♭ maior",
  Bb: "Si♭ maior",
  F: "Fá maior",
  Am: "Lá menor",
  Em: "Mi menor",
  Bm: "Si menor",
  "F#m": "Fá♯ menor",
  "C#m": "Dó♯ menor",
  "G#m": "Sol♯ menor",
  "D#m": "Ré♯ menor",
  Bbm: "Si♭ menor",
  Fm: "Fá menor",
  Cm: "Dó menor",
  Gm: "Sol menor",
  Dm: "Ré menor",
};
const KEY_SIGNATURES = Object.keys(KEY_LABELS) as KeySignature[];

function noteLabel(token: Extract<NotationToken, { type: "note" }>): string {
  return `${notePitchNamePt(token.pitch, token.accidental)}${token.octave}`;
}

// Editor de nota-a-nota (pedido desta sessão: "escrever partitura... que o aluno possa clicar na
// nota e ouvir ela") — sem digitar sintaxe ABC, o professor clica duração + acidente/expressão
// (opcionais) + tecla do teclado de piano, cada clique acrescenta um token à sequência, e o
// preview (abcjs) atualiza ao vivo. Uma nota já colocada pode ser clicada na partitura renderizada
// pra selecioná-la e ajustar a altura com as setas ↑/↓ (meio-tom por clique).
//
// Dois modos: não-controlado (`name`) serializa em ABC e envia via input escondido — mesmo padrão
// de MediaPickerField (campo controlado, mas o <form> em volta continua FormData), usado pelo form
// one-shot de "Adicionar exemplo" (lesson-examples-section.tsx). Controlado (`value`/`onChange`)
// nunca espelha `value` num state local — o bloco de partitura do page builder
// (notation-sheet-field-panel.tsx) reaproveita a mesma instância deste componente ao trocar de
// bloco selecionado; copiar `value` pra state só no mount deixaria a melodia "presa" no bloco
// anterior ao trocar de seleção. O painel que usa o modo controlado passa `key={block.id}` no
// componente pra garantir que a SELEÇÃO de nota (estado só deste componente, não faz parte de
// NotationComposition) também reseta ao trocar de bloco.
type NotationEditorProps =
  | { name: string; value?: undefined; onChange?: undefined }
  | { name?: undefined; value: NotationComposition; onChange: (next: NotationComposition) => void };

export function NotationEditor(props: NotationEditorProps) {
  const isControlled = props.onChange !== undefined;

  const [uncontrolledTokens, setUncontrolledTokens] = useState<NotationToken[]>([]);
  const [uncontrolledKey, setUncontrolledKey] = useState<KeySignature>("C");
  const [uncontrolledTimeSignature, setUncontrolledTimeSignature] = useState<TimeSignature>("4/4");
  const [uncontrolledBpm, setUncontrolledBpm] = useState(90);
  const [uncontrolledShowNoteNames, setUncontrolledShowNoteNames] = useState(false);
  const [uncontrolledLyrics, setUncontrolledLyrics] = useState<string[]>([]);
  const [uncontrolledVoices, setUncontrolledVoices] = useState<NotationVoice[]>([]);

  // Qual voz está sendo editada: 0 = voz 1 (tokens de raiz da composição), 1..N = voices[k-1].
  const [activeVoice, setActiveVoice] = useState(0);

  const rootTokens = isControlled ? props.value.tokens : uncontrolledTokens;
  const key = isControlled ? props.value.key : uncontrolledKey;
  const timeSignature = isControlled ? props.value.timeSignature : uncontrolledTimeSignature;
  const bpm = isControlled ? props.value.bpm : uncontrolledBpm;
  const showNoteNames = isControlled ? props.value.showNoteNames : uncontrolledShowNoteNames;
  const lyrics = (isControlled ? props.value.lyrics : uncontrolledLyrics) ?? [];
  const voices = (isControlled ? props.value.voices : uncontrolledVoices) ?? [];

  const safeActiveVoice = activeVoice > voices.length ? 0 : activeVoice;
  // `tokens` a partir daqui é SEMPRE a voz ativa — todo o resto do editor (piano, teclado,
  // transpor, cifra, undo, ABC…) opera sobre ela sem saber que existem outras.
  const tokens = safeActiveVoice === 0 ? rootTokens : voices[safeActiveVoice - 1]?.tokens ?? [];

  // Base pra todo commit em modo controlado — sem isso, mudar o tom (commitKey) descartaria a
  // letra/vozes e vice-versa. `tokens` aqui é o de RAIZ (voz 1), não o alias da voz ativa.
  const composition: NotationComposition = {
    tokens: rootTokens,
    key,
    timeSignature,
    bpm,
    showNoteNames,
    lyrics,
    voices: voices.length > 0 ? voices : undefined,
  };

  const [duration, setDuration] = useState<NoteDuration>("quarter");
  // Ponto de aumento — modificador "grudento" da figura corrente (como a própria figura, não
  // zera a cada nota). Aplicado só na hora de criar a nota/pausa, via withDot.
  const [dotted, setDotted] = useState(false);
  // Único acidente que sobrou como toggle: "Natural", pra cancelar acidente implícito da armadura
  // de clave numa tecla branca. Sustenido agora vem direto da tecla preta do PianoKeyboard.
  const [natural, setNatural] = useState(false);
  const [staccato, setStaccato] = useState(false);
  const [accent, setAccent] = useState(false);
  const [fermata, setFermata] = useState(false);
  const [tied, setTied] = useState(false);
  const [slurStart, setSlurStart] = useState(false);
  const [slurEnd, setSlurEnd] = useState(false);
  const [crescendoStart, setCrescendoStart] = useState(false);
  const [crescendoEnd, setCrescendoEnd] = useState(false);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  // Acidente da PRÓXIMA nota digitada por teclado ("#" / "-" / "="), zerado assim que ela entra —
  // paralelo ao toggle "Natural" do mouse, mas de uso único.
  const [pendingAccidental, setPendingAccidental] = useState<Accidental | null>(null);

  // Painel "editar como texto (ABC)": abcDraft null = fechado/sem edição pendente (mostra o ABC
  // derivado); string = rascunho sendo editado, ainda não aplicado.
  const [abcDraft, setAbcDraft] = useState<string | null>(null);
  const [abcError, setAbcError] = useState<string | null>(null);
  const [abcWarnings, setAbcWarnings] = useState<string[]>([]);

  const previewRef = useRef<HTMLDivElement>(null);

  const { abc, noteRanges } = compositionToAbcWithRanges(composition, { rangesForVoice: safeActiveVoice });
  const selectedToken = selectedIndex !== null ? tokens[selectedIndex] : undefined;

  let lastNoteIndex = -1;
  for (let i = tokens.length - 1; i >= 0; i -= 1) {
    if (tokens[i].type === "note") {
      lastNoteIndex = i;
      break;
    }
  }
  const lastNote =
    lastNoteIndex >= 0
      ? (tokens[lastNoteIndex] as Extract<NotationToken, { type: "note" }>)
      : null;
  const octaveRange = { min: PIANO_OCTAVES[0], max: PIANO_OCTAVES[PIANO_OCTAVES.length - 1] };

  function commitVoices(next: NotationVoice[]) {
    if (isControlled) props.onChange({ ...composition, voices: next.length > 0 ? next : undefined });
    else setUncontrolledVoices(next);
  }

  function commitTokens(next: NotationToken[]) {
    if (safeActiveVoice === 0) {
      if (isControlled) props.onChange({ ...composition, tokens: next });
      else setUncontrolledTokens(next);
      return;
    }
    commitVoices(voices.map((voice, index) => (index === safeActiveVoice - 1 ? { ...voice, tokens: next } : voice)));
  }

  function addVoice() {
    commitVoices([...voices, { name: "", tokens: [] }]);
    setSelectedIndex(null);
    setActiveVoice(voices.length + 1);
  }

  function removeActiveVoice() {
    if (safeActiveVoice === 0) return;
    commitVoices(voices.filter((_, index) => index !== safeActiveVoice - 1));
    setSelectedIndex(null);
    setActiveVoice(0);
  }

  function renameActiveVoice(name: string) {
    if (safeActiveVoice === 0) return;
    commitVoices(voices.map((voice, index) => (index === safeActiveVoice - 1 ? { ...voice, name } : voice)));
  }

  function commitKey(next: KeySignature) {
    if (isControlled) props.onChange({ ...composition, key: next });
    else setUncontrolledKey(next);
  }

  function commitTimeSignature(next: TimeSignature) {
    if (isControlled) props.onChange({ ...composition, timeSignature: next });
    else setUncontrolledTimeSignature(next);
  }

  function commitBpm(next: number) {
    const clamped = Math.min(MAX_BPM, Math.max(MIN_BPM, next));
    if (isControlled) props.onChange({ ...composition, bpm: clamped });
    else setUncontrolledBpm(clamped);
  }

  function commitShowNoteNames(next: boolean) {
    if (isControlled) props.onChange({ ...composition, showNoteNames: next });
    else setUncontrolledShowNoteNames(next);
  }

  function commitLyrics(next: string[]) {
    if (isControlled) props.onChange({ ...composition, lyrics: next });
    else setUncontrolledLyrics(next);
  }

  // Substitui a composição inteira de uma vez (usado ao Aplicar o painel de ABC) — evita cinco
  // commits em sequência, cada um lendo o estado anterior.
  function commitComposition(next: NotationComposition) {
    if (isControlled) {
      props.onChange(next);
    } else {
      setUncontrolledTokens(next.tokens);
      setUncontrolledKey(next.key);
      setUncontrolledTimeSignature(next.timeSignature);
      setUncontrolledBpm(next.bpm);
      setUncontrolledShowNoteNames(next.showNoteNames);
      setUncontrolledLyrics(next.lyrics ?? []);
      setUncontrolledVoices(next.voices ?? []);
    }
    setActiveVoice(0);
  }

  function applyAbcDraft() {
    if (abcDraft === null) return;
    const result = parseAbcToComposition(abcDraft);
    if ("error" in result) {
      setAbcError(result.error);
      setAbcWarnings([]);
      return;
    }
    commitComposition(result.composition);
    setAbcDraft(null);
    setAbcError(null);
    setAbcWarnings(result.warnings);
    setSelectedIndex(null);
  }

  useEffect(() => {
    if (!previewRef.current) return;
    if (tokens.length === 0) {
      previewRef.current.innerHTML = "";
      return;
    }
    // staffwidth + wrap fazem o abcjs quebrar os compassos em várias linhas pra caber (ver
    // src/components/interactive-notation.tsx) — sem "responsive: resize", que encolheria o SVG.
    const previewWidth = Math.max(240, previewRef.current.clientWidth - 24);
    const previewPerLine = Math.max(1, Math.floor(previewWidth / 150));
    const tunes = renderAbc(previewRef.current, abc, {
      staffwidth: previewWidth,
      wrap: { minSpacing: 1.6, maxSpacing: 2.7, preferredMeasuresPerLine: previewPerLine },
      selectTypes: ["note"],
      clickListener: (abcElem) => {
        if (abcElem.startChar === undefined) return;
        const startChar = abcElem.startChar;
        const range = noteRanges.find((r) => startChar >= r.start && startChar < r.end);
        if (range) setSelectedIndex(range.tokenIndex);
      },
    });

    const tune = tunes[0];
    // Destaque da nota selecionada: TimingCallbacks intercala os eventos de TODAS as vozes, então
    // o índice dentro dos ranges de uma voz não bate em multi-voz — nesse caso, sem destaque
    // (clicar pra selecionar continua funcionando).
    if (!tune || selectedIndex === null || voices.length > 0) return;
    const position = noteRanges.findIndex((r) => r.tokenIndex === selectedIndex);
    if (position < 0) return;
    const timing = new TimingCallbacks(tune);
    const noteEvents = timing.noteTimings.filter((event) => event.type === "event" && event.midiPitches && event.midiPitches.length > 0);
    const elements = (noteEvents[position]?.elements ?? []).flat();
    elements.forEach((el) => el.classList.add("fill-primary"));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- noteRanges é derivado de abc a cada render, incluí-lo re-executaria o efeito sem motivo
  }, [abc, tokens.length, selectedIndex]);

  function addNote(pitch: PitchLetter, octave: number, accidental: Accidental | null) {
    commitTokens([
      ...tokens,
      {
        type: "note",
        pitch,
        octave,
        accidental,
        duration: withDot(duration, dotted),
        staccato,
        accent,
        fermata,
        tied,
        crescendo: crescendoStart ? "start" : crescendoEnd ? "end" : null,
        slur: slurStart ? "start" : slurEnd ? "end" : null,
        chord: null,
      },
    ]);
    setNatural(false);
    setStaccato(false);
    setAccent(false);
    setFermata(false);
    setTied(false);
    setSlurStart(false);
    setSlurEnd(false);
    setCrescendoStart(false);
    setCrescendoEnd(false);
    setSelectedIndex(null);
  }

  function handlePianoKey(pitch: PitchLetter, octave: number, keyAccidental: "sharp" | null) {
    addNote(pitch, octave, keyAccidental ?? (natural ? "natural" : null));
  }

  function addRest() {
    commitTokens([...tokens, { type: "rest", duration: withDot(duration, dotted) }]);
  }

  function addBar() {
    commitTokens([...tokens, { type: "bar" }]);
  }

  function undo() {
    commitTokens(tokens.slice(0, -1));
    setSelectedIndex(null);
  }

  function clear() {
    commitTokens([]);
    setSelectedIndex(null);
  }

  function transposeTokenAt(index: number, semitones: number) {
    const token = tokens[index];
    if (!token || token.type !== "note") return;
    const midi = noteToMidi(token.pitch, token.octave, token.accidental) + semitones;
    const { pitch, octave, accidental } = midiToNote(midi);
    const next = tokens.slice();
    next[index] = { ...token, pitch, octave, accidental };
    commitTokens(next);
  }

  function transposeSelected(semitones: number) {
    if (selectedIndex === null) return;
    transposeTokenAt(selectedIndex, semitones);
  }

  // Digitação de notação pelo teclado do computador (ver notation-keyboard.ts): a..g = altura na
  // oitava mais próxima da última nota; 1..5 = figura; "#" / "-" / "=" = acidente da próxima nota;
  // "r" = pausa; espaço ou "|" = barra; Backspace = desfazer; ↑/↓ = transpõe a nota selecionada
  // (ou a última); ←/→ = anda a seleção. Ignora quando o foco está num <input>/<textarea> interno
  // (cifra, BPM) ou quando há Ctrl/Cmd/Alt (atalhos do navegador).
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;

    const lower = event.key.toLowerCase();

    if (lower in PITCH_KEYS) {
      event.preventDefault();
      const { pitch, octave, accidental } = resolveTypedNote(
        PITCH_KEYS[lower],
        lastNote,
        pendingAccidental ?? (natural ? "natural" : null),
        octaveRange,
      );
      addNote(pitch, octave, accidental);
      setPendingAccidental(null);
      return;
    }

    if (event.key in DURATION_KEYS) {
      event.preventDefault();
      setDuration(DURATION_KEYS[event.key]);
      return;
    }

    if (event.key === ".") {
      event.preventDefault();
      setDotted((prev) => !prev);
      return;
    }

    if (event.key === "#" || lower === "s") {
      event.preventDefault();
      setPendingAccidental("sharp");
      return;
    }
    if (event.key === "-" || event.key === "_") {
      event.preventDefault();
      setPendingAccidental("flat");
      return;
    }
    if (event.key === "=" || lower === "n") {
      event.preventDefault();
      setPendingAccidental("natural");
      return;
    }

    if (lower === "r") {
      event.preventDefault();
      addRest();
      return;
    }
    if (event.key === " " || event.key === "|") {
      event.preventDefault();
      addBar();
      return;
    }
    if (event.key === "Backspace") {
      event.preventDefault();
      undo();
      return;
    }

    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      const index = selectedIndex ?? (lastNoteIndex >= 0 ? lastNoteIndex : null);
      if (index === null) return;
      event.preventDefault();
      transposeTokenAt(index, event.key === "ArrowUp" ? 1 : -1);
      return;
    }

    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      const noteIndices = tokens.reduce<number[]>((acc, token, index) => {
        if (token.type === "note") acc.push(index);
        return acc;
      }, []);
      if (noteIndices.length === 0) return;
      event.preventDefault();
      const currentPos = selectedIndex === null ? -1 : noteIndices.indexOf(selectedIndex);
      const nextPos =
        event.key === "ArrowRight"
          ? Math.min(noteIndices.length - 1, currentPos + 1)
          : Math.max(0, currentPos < 0 ? noteIndices.length - 1 : currentPos - 1);
      setSelectedIndex(noteIndices[nextPos]);
    }
  }

  function updateSelectedChord(chord: string) {
    if (selectedIndex === null) return;
    const token = tokens[selectedIndex];
    if (!token || token.type !== "note") return;
    const next = tokens.slice();
    next[selectedIndex] = { ...token, chord: chord.length > 0 ? chord : null };
    commitTokens(next);
  }

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="application"
      aria-label="Editor de partitura — digite a..g para notas, 1..5 para a figura"
      className="space-y-3 rounded-lg border border-border p-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {!isControlled && (
        <input
          type="hidden"
          name={props.name}
          value={rootTokens.length > 0 || voices.some((voice) => voice.tokens.length > 0) ? abc : ""}
        />
      )}

      {/* Abas de voz — só aparecem quando há mais de uma, ou o botão de adicionar. A 1ª é sempre a
          melodia (os tokens de raiz da composição). */}
      <div className="flex flex-wrap items-center gap-1" role="tablist" aria-label="Vozes">
        {[{ name: "Voz 1 (melodia)" }, ...voices].map((voice, index) => (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={safeActiveVoice === index}
            onClick={() => {
              setActiveVoice(index);
              setSelectedIndex(null);
            }}
            className={cn(
              "rounded-md border px-2 py-1 text-xs font-medium outline-none ui-motion-base focus-visible:ring-2 focus-visible:ring-ring",
              safeActiveVoice === index
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-ring",
            )}
          >
            {index === 0 ? "Voz 1 (melodia)" : voice.name && voice.name.length > 0 ? voice.name : `Voz ${index + 1}`}
          </button>
        ))}
        <button
          type="button"
          onClick={addVoice}
          className="rounded-md border border-border px-2 py-1 text-xs font-medium text-muted-foreground outline-none ui-motion-base hover:border-ring focus-visible:ring-2 focus-visible:ring-ring"
        >
          + voz
        </button>
      </div>

      {safeActiveVoice > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={voices[safeActiveVoice - 1]?.name ?? ""}
            onChange={(event) => renameActiveVoice(event.target.value)}
            placeholder={`Nome da voz ${safeActiveVoice + 1} (ex: 2ª voz, Baixo)`}
            className="w-56 rounded-md border border-border px-2 py-1 text-xs"
            aria-label="Nome da voz"
          />
          <Button type="button" variant="ghost" size="xs" onClick={removeActiveVoice}>
            Remover esta voz
          </Button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="w-32">
          <label className="block text-[10px] font-medium text-muted-foreground/56 uppercase">Compasso</label>
          <Select value={timeSignature} onValueChange={(value) => commitTimeSignature(value as TimeSignature)}>
            <SelectTrigger className="mt-1 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_SIGNATURES.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-40">
          <label className="block text-[10px] font-medium text-muted-foreground/56 uppercase">Tonalidade</label>
          <Select value={key} onValueChange={(value) => commitKey(value as KeySignature)}>
            <SelectTrigger className="mt-1 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KEY_SIGNATURES.map((value) => (
                <SelectItem key={value} value={value}>
                  {KEY_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-24">
          <label className="block text-[10px] font-medium text-muted-foreground/56 uppercase">BPM</label>
          <input
            type="number"
            min={MIN_BPM}
            max={MAX_BPM}
            value={bpm}
            onChange={(event) => commitBpm(Number(event.target.value) || bpm)}
            className="mt-1 w-full rounded-md border border-border px-2 py-1 text-sm"
          />
        </div>

        <label className="flex items-center gap-2 self-end pb-1 text-xs font-medium text-muted-foreground">
          <input type="checkbox" checked={showNoteNames} onChange={(event) => commitShowNoteNames(event.target.checked)} />
          Nome das notas
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1" role="group" aria-label="Duração da nota">
          {DURATIONS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setDuration(item.value)}
              className={cn(
                "flex size-8 items-center justify-center rounded-md border text-base outline-none ui-motion-base focus-visible:ring-2 focus-visible:ring-ring",
                duration === item.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-ring",
              )}
              aria-pressed={duration === item.value}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setDotted((prev) => !prev)}
            disabled={!canDot(duration)}
            className={cn(
              "flex size-8 items-center justify-center rounded-md border text-xl leading-none outline-none ui-motion-base focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40",
              dotted && canDot(duration)
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-ring",
            )}
            aria-pressed={dotted}
            title="Ponto de aumento — vale 1,5× a figura (semínima pontuada etc.). Tecla ."
          >
            ·
          </button>
        </div>

        <button
          type="button"
          onClick={() => setNatural((prev) => !prev)}
          className={cn(
            "flex size-8 items-center justify-center rounded-md border text-base outline-none ui-motion-base focus-visible:ring-2 focus-visible:ring-ring",
            natural ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-ring",
          )}
          aria-pressed={natural}
          title="Natural (cancela acidente da armadura de clave)"
        >
          ♮
        </button>

        <Button type="button" variant="outline" size="sm" onClick={addRest}>
          Pausa
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={addBar}>
          Barra |
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={undo} disabled={tokens.length === 0} aria-label="Desfazer última nota">
          <Delete className="size-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={clear} disabled={tokens.length === 0} aria-label="Limpar tudo">
          <RotateCcw className="size-4" />
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Expressão">
        {(
          [
            { active: staccato, toggle: () => setStaccato((prev) => !prev), label: ".", title: "Staccato" },
            { active: accent, toggle: () => setAccent((prev) => !prev), label: ">", title: "Acento" },
            { active: fermata, toggle: () => setFermata((prev) => !prev), label: "𝄐", title: "Fermata" },
            { active: tied, toggle: () => setTied((prev) => !prev), label: "⌢", title: "Ligar à próxima nota (tie)" },
          ] as const
        ).map((item) => (
          <button
            key={item.title}
            type="button"
            title={item.title}
            onClick={item.toggle}
            className={cn(
              "flex h-8 min-w-8 items-center justify-center rounded-md border px-1.5 text-base outline-none ui-motion-base focus-visible:ring-2 focus-visible:ring-ring",
              item.active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-ring",
            )}
            aria-pressed={item.active}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Ligaduras e dinâmica">
        {(
          [
            { active: slurStart, toggle: () => setSlurStart((prev) => !prev), label: "Iniciar frase" },
            { active: slurEnd, toggle: () => setSlurEnd((prev) => !prev), label: "Terminar frase" },
            { active: crescendoStart, toggle: () => setCrescendoStart((prev) => !prev), label: "Iniciar crescendo" },
            { active: crescendoEnd, toggle: () => setCrescendoEnd((prev) => !prev), label: "Terminar crescendo" },
          ] as const
        ).map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.toggle}
            className={cn(
              "flex h-8 items-center justify-center rounded-md border px-2 text-xs outline-none ui-motion-base focus-visible:ring-2 focus-visible:ring-ring",
              item.active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-ring",
            )}
            aria-pressed={item.active}
          >
            {item.label}
          </button>
        ))}
      </div>

      <PianoKeyboard octaves={PIANO_OCTAVES} onKeyClick={handlePianoKey} />

      <p className="text-xs text-muted-foreground/56">
        Teclado do computador: <span className="font-medium text-muted-foreground">a</span>–
        <span className="font-medium text-muted-foreground">g</span> nota ·{" "}
        <span className="font-medium text-muted-foreground">1</span>–
        <span className="font-medium text-muted-foreground">5</span> figura ·{" "}
        <span className="font-medium text-muted-foreground">.</span> ponto ·{" "}
        <span className="font-medium text-muted-foreground">#</span> /{" "}
        <span className="font-medium text-muted-foreground">-</span> /{" "}
        <span className="font-medium text-muted-foreground">=</span> acidente ·{" "}
        <span className="font-medium text-muted-foreground">r</span> pausa · espaço barra · Backspace desfaz · ↑/↓ transpõe ·
        ←/→ seleção
        {pendingAccidental && (
          <span className="ml-1 text-primary">
            (próxima nota: {pendingAccidental === "sharp" ? "♯" : pendingAccidental === "flat" ? "♭" : "♮"})
          </span>
        )}
      </p>

      <details className="rounded-md border border-border">
        <summary className="cursor-pointer px-2.5 py-1.5 text-xs font-medium text-muted-foreground outline-none ui-motion-base hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
          Editar como texto (ABC) — ou colar de outro lugar
        </summary>
        <div className="space-y-1.5 border-t border-border p-2.5">
          <textarea
            value={abcDraft ?? abc}
            onChange={(event) => {
              setAbcDraft(event.target.value);
              setAbcError(null);
            }}
            spellCheck={false}
            rows={5}
            className="w-full rounded-md border border-border p-2 font-mono text-xs"
            aria-label="Notação ABC"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" size="xs" onClick={applyAbcDraft} disabled={abcDraft === null}>
              Aplicar
            </Button>
            {abcDraft !== null && (
              <Button
                type="button"
                size="xs"
                variant="ghost"
                onClick={() => {
                  setAbcDraft(null);
                  setAbcError(null);
                }}
              >
                Descartar
              </Button>
            )}
            {abcError && <span className="text-xs text-destructive">{abcError}</span>}
          </div>
          {abcWarnings.length > 0 && (
            <ul className="space-y-0.5 text-xs text-warning">
              {abcWarnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          )}
          <p className="text-xs text-muted-foreground/56">
            Cole uma notação ABC e clique em Aplicar. Formatos avançados (várias vozes, acordes) são aproximados.
          </p>
        </div>
      </details>

      <div className="space-y-1">
        <label className="block text-[10px] font-medium text-muted-foreground/56 uppercase">Letra (opcional, um verso por linha)</label>
        <textarea
          value={lyrics.join("\n")}
          onChange={(event) => commitLyrics(event.target.value.split("\n"))}
          rows={2}
          placeholder="Je-sus Cris-to mu-dou meu vi-ver"
          className="w-full rounded-md border border-border p-2 text-xs"
          aria-label="Letra"
        />
        <p className="text-xs text-muted-foreground/56">
          Separe as sílabas com espaço; use <span className="font-medium text-muted-foreground">-</span> dentro da palavra e{" "}
          <span className="font-medium text-muted-foreground">_</span> pra prolongar a nota anterior.
        </p>
      </div>

      {tokens.length === 0 ? (
        <p className="text-xs text-muted-foreground/56">
          Clique no editor pra focar, então digite as notas no teclado do computador — ou escolha a duração e clique no
          teclado de piano acima.
        </p>
      ) : (
        <>
          <div ref={previewRef} className="overflow-x-auto rounded-md bg-card p-2" />
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {selectedToken && selectedToken.type === "note" ? (
              <>
                <span>
                  Nota selecionada: <span className="font-medium text-foreground">{noteLabel(selectedToken)}</span>
                </span>
                <Button type="button" variant="outline" size="xs" onClick={() => transposeSelected(-1)}>
                  ↓ meio-tom
                </Button>
                <Button type="button" variant="outline" size="xs" onClick={() => transposeSelected(1)}>
                  ↑ meio-tom
                </Button>
                <div className="flex items-center gap-1.5">
                  <label className="text-[10px] font-medium text-muted-foreground/56 uppercase">Cifra</label>
                  <input
                    type="text"
                    value={selectedToken.chord ?? ""}
                    onChange={(event) => updateSelectedChord(event.target.value)}
                    placeholder="Ex: C, G7, Am"
                    className="w-24 rounded-md border border-border px-2 py-1 text-xs"
                  />
                </div>
                <Button type="button" variant="ghost" size="xs" onClick={() => setSelectedIndex(null)}>
                  Cancelar seleção
                </Button>
              </>
            ) : (
              <span>Clique numa nota da partitura acima pra selecioná-la e ajustar a altura ou adicionar cifra.</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
