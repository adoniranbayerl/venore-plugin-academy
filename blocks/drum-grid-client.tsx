"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { Button } from "@venore/plugin-sdk/ui";
import { cn } from "@venore/plugin-sdk/ui";
import { DRUM_STEPS_PER_BAR, type DrumPattern, type DrumVoice } from "./drum-grid-patterns";

// Sons sintetizados via Web Audio — sem samples (não podem ir num bloco estático). kick = seno com
// queda de frequência; caixa/chimbal = ruído filtrado com envelope curto.
function playKick(ctx: AudioContext, at: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.setValueAtTime(140, at);
  osc.frequency.exponentialRampToValueAtTime(48, at + 0.11);
  gain.gain.setValueAtTime(0.9, at);
  gain.gain.exponentialRampToValueAtTime(0.001, at + 0.16);
  osc.connect(gain).connect(ctx.destination);
  osc.start(at);
  osc.stop(at + 0.18);
}

function noiseBuffer(ctx: AudioContext): AudioBuffer {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function playNoise(ctx: AudioContext, at: number, opts: { hp: number; dur: number; gain: number }) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = opts.hp;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(opts.gain, at);
  gain.gain.exponentialRampToValueAtTime(0.001, at + opts.dur);
  src.connect(filter).connect(gain).connect(ctx.destination);
  src.start(at);
  src.stop(at + opts.dur + 0.02);
}

function trigger(ctx: AudioContext, voice: DrumVoice, at: number) {
  if (voice === "kick") playKick(ctx, at);
  else if (voice === "snare") playNoise(ctx, at, { hp: 1400, dur: 0.14, gain: 0.5 });
  else playNoise(ctx, at, { hp: 7000, dur: 0.04, gain: 0.28 });
}

export function DrumGridClient({
  pattern,
  bpm,
  bars,
  caption,
}: {
  pattern: DrumPattern;
  bpm: number;
  bars: number;
  caption: string;
}) {
  const ctxRef = useRef<AudioContext | null>(null);
  const stopRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    return () => {
      if (stopRef.current !== null) window.clearTimeout(stopRef.current);
      void ctxRef.current?.close();
    };
  }, []);

  function stop() {
    if (stopRef.current !== null) window.clearTimeout(stopRef.current);
    stopRef.current = null;
    void ctxRef.current?.close();
    ctxRef.current = null;
    setPlaying(false);
  }

  function play() {
    if (playing) {
      stop();
      return;
    }
    const AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;
    const ctx = new AudioCtor();
    ctxRef.current = ctx;
    setPlaying(true);

    const stepDur = 60 / bpm / 4; // semicolcheia (16 passos por compasso 4/4)
    const start = ctx.currentTime + 0.06;
    for (let bar = 0; bar < bars; bar += 1) {
      for (let step = 0; step < DRUM_STEPS_PER_BAR; step += 1) {
        const at = start + (bar * DRUM_STEPS_PER_BAR + step) * stepDur;
        for (const row of pattern.rows) {
          if (row.steps[step]) trigger(ctx, row.voice, at);
        }
      }
    }
    const totalMs = bars * DRUM_STEPS_PER_BAR * stepDur * 1000 + 200;
    stopRef.current = window.setTimeout(stop, totalMs);
  }

  return (
    <div className="space-y-2 rounded-md border border-border bg-card p-3">
      {caption && <p className="text-xs text-muted-foreground">{caption}</p>}
      <p className="text-[11px] font-medium tracking-caps text-muted-foreground/56 uppercase">
        {pattern.label} · {bpm} BPM
      </p>

      <div className="space-y-1 overflow-x-auto">
        {pattern.rows.map((row) => (
          <div key={row.voice} className="flex items-center gap-2">
            <span className="w-16 shrink-0 text-xs text-muted-foreground">{row.label}</span>
            <div className="flex gap-0.5">
              {row.steps.map((on, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  className={cn(
                    "size-3 rounded-[3px] border",
                    i % 4 === 0 ? "border-ring" : "border-border",
                    on ? "bg-primary" : "bg-muted",
                  )}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" size="sm" onClick={play}>
        {playing ? <Pause className="size-3.5" aria-hidden="true" /> : <Play className="size-3.5" aria-hidden="true" />}
        {playing ? "Parar" : "Ouvir a levada"}
      </Button>
    </div>
  );
}
