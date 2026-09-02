import type { BlockRendererProps } from "@venore/plugin-sdk";
import { CHORD_INTERVALS, INTERVAL_SEMITONES, type EarDirection, type EarQuestionKind } from "./ear-trainer-abc";
import { EarTrainerClient } from "./ear-trainer-client";

function readString(data: Record<string, unknown>, field: string): string {
  const value = data[field];
  return typeof value === "string" ? value : "";
}

function readList(data: Record<string, unknown>, field: string): string[] {
  return readString(data, field)
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

export function AcademyEarTrainerBlock({ block }: BlockRendererProps) {
  const mode: EarQuestionKind = readString(block.data, "mode") === "chord" ? "chord" : "interval";
  const catalog = mode === "chord" ? CHORD_INTERVALS : INTERVAL_SEMITONES;

  const set = readList(block.data, "set").filter((id) => id in catalog);
  if (set.length === 0) return null;

  const rootsRaw = readList(block.data, "roots");
  const roots = rootsRaw.length > 0 ? rootsRaw : ["C"];
  const dir = readString(block.data, "direction");
  const direction: EarDirection = dir === "desc" ? "desc" : dir === "harmonic" ? "harmonic" : "asc";
  const roundsValue = block.data.rounds;
  const rounds = typeof roundsValue === "number" && roundsValue > 0 ? Math.min(30, Math.round(roundsValue)) : 10;

  return (
    <EarTrainerClient
      mode={mode}
      set={set}
      roots={roots}
      direction={direction}
      rounds={rounds}
      caption={readString(block.data, "caption")}
    />
  );
}
