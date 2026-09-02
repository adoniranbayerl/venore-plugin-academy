import type { BlockRendererProps } from "@venore/plugin-sdk";
import { DRUM_PATTERNS } from "./drum-grid-patterns";
import { DrumGridClient } from "./drum-grid-client";

function readString(data: Record<string, unknown>, field: string): string {
  const value = data[field];
  return typeof value === "string" ? value : "";
}

function readNumber(data: Record<string, unknown>, field: string, fallback: number): number {
  const value = data[field];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function AcademyDrumGridBlock({ block }: BlockRendererProps) {
  const style = readString(block.data, "style") || "backbeat";
  const pattern = DRUM_PATTERNS[style] ?? DRUM_PATTERNS.backbeat;
  const bpm = Math.min(200, Math.max(40, Math.round(readNumber(block.data, "bpm", 96))));
  const bars = Math.min(8, Math.max(1, Math.round(readNumber(block.data, "bars", 2))));

  return <DrumGridClient pattern={pattern} bpm={bpm} bars={bars} caption={readString(block.data, "caption")} />;
}
