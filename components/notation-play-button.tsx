"use client";

import { useEffect, useRef, useState } from "react";
import { renderAbc, synth, type MidiBuffer } from "abcjs";
import { Pause, Play, Repeat } from "lucide-react";
import { Button } from "@venore/plugin-sdk/ui";
import { cn } from "@venore/plugin-sdk/ui";

// Botão "Ouvir" pra um trecho de notação ABC — renderiza a partitura num container invisível só
// pra alimentar o synth do abcjs e toca. Usado nas perguntas de quiz do tipo "audio" (treino de
// ouvido, docs/academy-recursos-musicais.md #2), tanto na tela do aluno quanto no preview do
// professor. Não mostra a partitura de propósito: numa questão de ouvido, ver as notas entregaria
// a resposta.
export function NotationPlayButton({
  abc,
  label = "Ouvir",
  size = "sm",
}: {
  abc: string;
  label?: string;
  size?: "sm" | "xs";
}) {
  const renderRef = useRef<HTMLDivElement>(null);
  const bufferRef = useRef<MidiBuffer | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const loopRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [loop, setLoop] = useState(false);

  function stop() {
    bufferRef.current?.stop();
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    setPlaying(false);
  }

  useEffect(() => stop, []);

  async function play() {
    if (!renderRef.current || !synth.supportsAudio()) return;
    stop();
    const tunes = renderAbc(renderRef.current, abc, {});
    const tune = tunes[0];
    if (!tune) return;

    const buffer = new synth.CreateSynth();
    bufferRef.current = buffer;
    try {
      await buffer.init({ visualObj: tune });
      const primed = await buffer.prime();
      buffer.start();
      setPlaying(true);
      const durationMs = (primed?.duration ?? 0) * 1000;
      timeoutRef.current = window.setTimeout(
        () => {
          if (loopRef.current && bufferRef.current === buffer) void play();
          else setPlaying(false);
        },
        durationMs > 0 ? durationMs + 250 : 8000,
      );
    } catch {
      setPlaying(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-1">
      <Button type="button" variant="outline" size={size} onClick={playing ? stop : play}>
        {playing ? <Pause className="size-3.5" aria-hidden="true" /> : <Play className="size-3.5" aria-hidden="true" />}
        {playing ? "Parar" : label}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-pressed={loop}
        title="Repetir em loop"
        className={cn("size-8", loop ? "text-primary" : "text-muted-foreground/56")}
        onClick={() => {
          loopRef.current = !loop;
          setLoop(!loop);
        }}
      >
        <Repeat className="size-3.5" aria-hidden="true" />
      </Button>
      <span ref={renderRef} className="sr-only" aria-hidden="true" />
    </span>
  );
}
