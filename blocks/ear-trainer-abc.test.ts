import { parseOnly } from "abcjs";
import { describe, expect, it } from "vitest";
import { earQuestionToAbc, INTERVAL_SEMITONES } from "./ear-trainer-abc";

function noteCount(abc: string): number {
  const tune = parseOnly(abc)[0] as { lines?: { staff?: { voices?: { el_type?: string }[][] }[] }[] };
  const voice = tune.lines?.find((l) => l.staff)?.staff?.[0]?.voices?.[0] ?? [];
  return voice.filter((e) => e.el_type === "note").length;
}

describe("earQuestionToAbc", () => {
  it("intervalo melódico ascendente = duas notas, ABC válido", () => {
    const abc = earQuestionToAbc({ kind: "interval", rootMidi: 60, answer: "5J", direction: "asc" });
    expect(abc).toContain("Q:1/4=84");
    expect(noteCount(abc)).toBe(2);
  });

  it("intervalo harmônico = um evento com duas alturas", () => {
    const abc = earQuestionToAbc({ kind: "interval", rootMidi: 60, answer: "3M", direction: "harmonic" });
    const tune = parseOnly(abc)[0] as { lines?: { staff?: { voices?: { el_type?: string; pitches?: unknown[] }[][] }[] }[] };
    const voice = tune.lines?.find((l) => l.staff)?.staff?.[0]?.voices?.[0] ?? [];
    const chord = voice.find((e) => e.el_type === "note");
    expect(chord?.pitches?.length).toBe(2);
  });

  it("acorde de sétima da dominante = quatro alturas", () => {
    const abc = earQuestionToAbc({ kind: "chord", rootMidi: 57, answer: "sétima da dominante", direction: "harmonic" });
    const tune = parseOnly(abc)[0] as { lines?: { staff?: { voices?: { el_type?: string; pitches?: unknown[] }[][] }[] }[] };
    const voice = tune.lines?.find((l) => l.staff)?.staff?.[0]?.voices?.[0] ?? [];
    expect(voice.find((e) => e.el_type === "note")?.pitches?.length).toBe(4);
  });

  it("todo intervalo do catálogo gera ABC parseável", () => {
    for (const id of Object.keys(INTERVAL_SEMITONES)) {
      const abc = earQuestionToAbc({ kind: "interval", rootMidi: 60, answer: id, direction: "asc" });
      expect(() => parseOnly(abc), id).not.toThrow();
      expect(noteCount(abc), id).toBe(2);
    }
  });
});
