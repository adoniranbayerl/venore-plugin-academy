"use client";

import { useMemo, useRef, useState } from "react";
import { renderAbc, synth, type MidiBuffer } from "abcjs";
import { Check, Play, RotateCcw, X } from "lucide-react";
import { Button } from "@venore/plugin-sdk/ui";
import { cn } from "@venore/plugin-sdk/ui";
import { INTERVAL_LABEL, earQuestionToAbc, type EarDirection, type EarQuestionKind } from "./ear-trainer-abc";

const NOTE_PC: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

function rootNameToMidi(name: string): number {
  const letter = name[0]?.toUpperCase() ?? "C";
  const acc = name.slice(1);
  const pc = (NOTE_PC[letter] ?? 0) + (acc.includes("#") ? 1 : acc.includes("b") ? -1 : 0);
  // Faixa Lá3–Sol#4 (57–68) — confortável e sem estourar pra grave.
  return 57 + ((pc + 12) % 12);
}

type Question = { rootMidi: number; answer: string; abc: string };

export function EarTrainerClient({
  mode,
  set,
  roots,
  direction,
  rounds,
  caption,
}: {
  mode: EarQuestionKind;
  set: string[];
  roots: string[];
  direction: EarDirection;
  rounds: number;
  caption: string;
}) {
  const renderRef = useRef<HTMLSpanElement>(null);
  const bufferRef = useRef<MidiBuffer | null>(null);

  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);

  const labelFor = useMemo(() => {
    return (id: string) => (mode === "chord" ? id : INTERVAL_LABEL[id] ?? id);
  }, [mode]);

  function nextQuestion() {
    const answer = set[Math.floor(Math.random() * set.length)];
    const rootMidi = rootNameToMidi(roots[Math.floor(Math.random() * roots.length)]);
    const dir: EarDirection = mode === "chord" ? "harmonic" : direction;
    const abc = earQuestionToAbc({ kind: mode, rootMidi, answer, direction: dir });
    setQuestion({ rootMidi, answer, abc });
    setPicked(null);
  }

  async function play(abc: string) {
    if (!renderRef.current || !synth.supportsAudio()) return;
    bufferRef.current?.stop();
    const tunes = renderAbc(renderRef.current, abc, {});
    const tune = tunes[0];
    if (!tune) return;
    const buffer = new synth.CreateSynth();
    bufferRef.current = buffer;
    try {
      await buffer.init({ visualObj: tune });
      await buffer.prime();
      buffer.start();
    } catch {
      /* áudio indisponível — o aluno pode tentar de novo */
    }
  }

  function start() {
    setRound(1);
    setScore(0);
    nextQuestion();
  }

  function choose(id: string) {
    if (picked || !question) return;
    setPicked(id);
    if (id === question.answer) setScore((value) => value + 1);
  }

  function advance() {
    if (round >= rounds) {
      setRound(rounds + 1); // tela final
      return;
    }
    setRound((value) => value + 1);
    nextQuestion();
  }

  const finished = round > rounds;
  const started = round >= 1 && !finished;

  return (
    <div className="space-y-3 rounded-md border border-border bg-card p-3">
      {caption && <p className="text-xs text-muted-foreground">{caption}</p>}
      <span ref={renderRef} className="sr-only" aria-hidden="true" />

      {!started && !finished && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {mode === "chord" ? "Ouça o acorde e escolha a qualidade." : "Ouça as duas notas e escolha o intervalo."}{" "}
            {rounds} perguntas.
          </p>
          <Button type="button" onClick={start}>
            <Play className="size-4" aria-hidden="true" /> Começar
          </Button>
        </div>
      )}

      {started && question && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground tabular-nums">
              Pergunta {round} de {rounds}
            </span>
            <span className="text-xs font-medium text-muted-foreground tabular-nums">Acertos: {score}</span>
          </div>

          <Button type="button" variant="outline" size="sm" onClick={() => play(question.abc)}>
            <Play className="size-3.5" aria-hidden="true" /> Ouvir
          </Button>

          <div className="flex flex-wrap gap-1.5">
            {set.map((id) => {
              const isAnswer = id === question.answer;
              const isPicked = id === picked;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => choose(id)}
                  disabled={picked !== null}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium outline-none ui-motion-base focus-visible:ring-2 focus-visible:ring-ring",
                    picked === null && "border-border text-foreground hover:border-ring",
                    picked !== null && isAnswer && "border-success-border bg-success-soft text-success",
                    picked !== null && isPicked && !isAnswer && "border-destructive/50 bg-destructive/10 text-destructive",
                    picked !== null && !isAnswer && !isPicked && "border-border text-muted-foreground/56",
                  )}
                >
                  {picked !== null && isAnswer && <Check className="size-3.5" aria-hidden="true" />}
                  {picked !== null && isPicked && !isAnswer && <X className="size-3.5" aria-hidden="true" />}
                  {labelFor(id)}
                </button>
              );
            })}
          </div>

          {picked !== null && (
            <Button type="button" size="sm" onClick={advance}>
              {round >= rounds ? "Ver resultado" : "Próxima"}
            </Button>
          )}
        </div>
      )}

      {finished && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Você acertou {score} de {rounds}.
          </p>
          <Button type="button" variant="outline" size="sm" onClick={start}>
            <RotateCcw className="size-3.5" aria-hidden="true" /> Recomeçar
          </Button>
        </div>
      )}
    </div>
  );
}
