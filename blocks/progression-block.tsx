import type { BlockRendererProps } from "@venore/plugin-sdk";
import type { KeySignature } from "../components/notation-abc";
import { NotationPlayButton } from "../components/notation-play-button";
import { parseProgression, progressionToAbc } from "./progression-abc";

function readString(data: Record<string, unknown>, field: string): string {
  const value = data[field];
  return typeof value === "string" ? value : "";
}

function readNumber(data: Record<string, unknown>, field: string, fallback: number): number {
  const value = data[field];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function AcademyProgressionBlock({ block }: BlockRendererProps) {
  const chordsInput = readString(block.data, "chords");
  const beatsPerChord = Math.max(1, Math.round(readNumber(block.data, "beatsPerChord", 4)));
  const entries = parseProgression(chordsInput, beatsPerChord);
  if (entries.length === 0) return null;

  const key = (readString(block.data, "key") || "C") as KeySignature;
  const bpm = Math.min(208, Math.max(40, Math.round(readNumber(block.data, "bpm", 90))));
  const caption = readString(block.data, "caption");
  const abc = progressionToAbc({ chords: entries, key, bpm });

  return (
    <div className="space-y-2 rounded-md border border-border bg-card p-3">
      {caption && <p className="text-xs text-muted-foreground">{caption}</p>}
      <div className="flex flex-wrap items-center gap-1.5">
        {entries.map((entry, index) => (
          <span
            key={index}
            className="rounded-md border border-border px-2 py-1 text-xs font-medium text-foreground tabular-nums"
          >
            {entry.symbol}
            {entry.beats !== beatsPerChord && <span className="text-muted-foreground/56"> ·{entry.beats}</span>}
          </span>
        ))}
      </div>
      <NotationPlayButton abc={abc} label="Ouvir a progressão" />
    </div>
  );
}
