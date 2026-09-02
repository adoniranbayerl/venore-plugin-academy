import { describe, expect, it } from "vitest";
import { compositionToAbc, type NotationComposition } from "./notation-abc";
import { parseAbcToComposition } from "./notation-abc-parse";

const base = { key: "A", timeSignature: "4/4", bpm: 96, showNoteNames: false } as const;

// O round-trip do que o editor gera tem que ser exato: serializa -> parseia -> serializa de novo
// deve bater string a string.
function roundTrip(composition: NotationComposition): string {
  const abc = compositionToAbc(composition);
  const result = parseAbcToComposition(abc);
  if ("error" in result) throw new Error(result.error);
  return compositionToAbc(result.composition);
}

describe("parseAbcToComposition — round-trip", () => {
  it("notas, pausa e barra", () => {
    const composition: NotationComposition = {
      ...base,
      tokens: [
        { type: "note", pitch: "A", octave: 4, accidental: null, duration: "quarter" },
        { type: "note", pitch: "C", octave: 5, accidental: null, duration: "eighth" },
        { type: "bar" },
        { type: "rest", duration: "half" },
        { type: "note", pitch: "E", octave: 5, accidental: null, duration: "whole" },
      ],
    };
    expect(roundTrip(composition)).toBe(compositionToAbc(composition));
  });

  it("figuras pontuadas (colcheia, semínima e mínima pontuadas)", () => {
    const composition: NotationComposition = {
      ...base,
      tokens: [
        { type: "note", pitch: "A", octave: 4, accidental: null, duration: "dotted-quarter" },
        { type: "note", pitch: "B", octave: 4, accidental: null, duration: "eighth" },
        { type: "bar" },
        { type: "note", pitch: "C", octave: 5, accidental: null, duration: "dotted-half" },
        { type: "rest", duration: "quarter" },
        { type: "bar" },
        { type: "note", pitch: "E", octave: 5, accidental: null, duration: "dotted-eighth" },
        { type: "note", pitch: "D", octave: 5, accidental: null, duration: "sixteenth" },
      ],
    };
    expect(roundTrip(composition)).toBe(compositionToAbc(composition));
    const parsed = parseAbcToComposition(compositionToAbc(composition));
    if ("error" in parsed) throw new Error(parsed.error);
    expect(parsed.composition.tokens.filter((token) => token.type === "note").map((token) => token.duration)).toEqual([
      "dotted-quarter",
      "eighth",
      "dotted-half",
      "dotted-eighth",
      "sixteenth",
    ]);
  });

  it("acidentes, semicolcheia e oitavas graves", () => {
    const composition: NotationComposition = {
      ...base,
      key: "C",
      tokens: [
        { type: "note", pitch: "F", octave: 4, accidental: "sharp", duration: "sixteenth" },
        { type: "note", pitch: "B", octave: 3, accidental: "flat", duration: "sixteenth" },
        { type: "note", pitch: "D", octave: 2, accidental: "natural", duration: "quarter" },
      ],
    };
    expect(roundTrip(composition)).toBe(compositionToAbc(composition));
  });

  it("cifra e ligadura de valor (tie)", () => {
    const composition: NotationComposition = {
      ...base,
      tokens: [
        { type: "note", pitch: "A", octave: 4, accidental: null, duration: "quarter", chord: "A" },
        { type: "note", pitch: "A", octave: 4, accidental: null, duration: "quarter", tied: true },
        { type: "note", pitch: "A", octave: 4, accidental: null, duration: "quarter" },
      ],
    };
    expect(roundTrip(composition)).toBe(compositionToAbc(composition));
  });

  it("staccato, acento e fermata", () => {
    const composition: NotationComposition = {
      ...base,
      tokens: [
        { type: "note", pitch: "A", octave: 4, accidental: null, duration: "quarter", staccato: true },
        { type: "note", pitch: "B", octave: 4, accidental: null, duration: "quarter", accent: true },
        { type: "note", pitch: "C", octave: 5, accidental: null, duration: "half", fermata: true },
      ],
    };
    expect(roundTrip(composition)).toBe(compositionToAbc(composition));
  });

  it("ligadura de expressão (slur) e crescendo", () => {
    const composition: NotationComposition = {
      ...base,
      tokens: [
        { type: "note", pitch: "A", octave: 4, accidental: null, duration: "eighth", slur: "start", crescendo: "start" },
        { type: "note", pitch: "B", octave: 4, accidental: null, duration: "eighth" },
        { type: "note", pitch: "C", octave: 5, accidental: null, duration: "eighth", slur: "end", crescendo: "end" },
      ],
    };
    expect(roundTrip(composition)).toBe(compositionToAbc(composition));
  });

  it("letra sob a pauta (w:)", () => {
    const composition: NotationComposition = {
      ...base,
      tokens: [
        { type: "note", pitch: "A", octave: 4, accidental: null, duration: "quarter" },
        { type: "note", pitch: "B", octave: 4, accidental: null, duration: "quarter" },
        { type: "note", pitch: "C", octave: 5, accidental: null, duration: "half" },
      ],
      lyrics: ["Je-sus Cris-to mu-dou", "mui-to go-zo eu tem"],
    };
    expect(roundTrip(composition)).toBe(compositionToAbc(composition));
    const parsed = parseAbcToComposition(compositionToAbc(composition));
    if ("error" in parsed) throw new Error(parsed.error);
    expect(parsed.composition.lyrics).toEqual(["Je-sus Cris-to mu-dou", "mui-to go-zo eu tem"]);
  });

  it("duas vozes na mesma composição, com nome", () => {
    const composition: NotationComposition = {
      ...base,
      tokens: [
        { type: "note", pitch: "E", octave: 5, accidental: null, duration: "quarter" },
        { type: "note", pitch: "C", octave: 5, accidental: null, duration: "quarter" },
        { type: "bar" },
      ],
      voices: [
        {
          name: "2a voz",
          tokens: [
            { type: "note", pitch: "C", octave: 5, accidental: null, duration: "quarter" },
            { type: "note", pitch: "A", octave: 4, accidental: null, duration: "quarter" },
            { type: "bar" },
          ],
        },
      ],
    };
    expect(roundTrip(composition)).toBe(compositionToAbc(composition));
    const parsed = parseAbcToComposition(compositionToAbc(composition));
    if ("error" in parsed) throw new Error(parsed.error);
    expect(parsed.composition.voices).toHaveLength(1);
    expect(parsed.composition.voices?.[0].name).toBe("2a voz");
    expect(parsed.composition.voices?.[0].tokens.filter((token) => token.type === "note")).toHaveLength(2);
  });

  it("duas vozes + letra alinhada à voz 1", () => {
    const composition: NotationComposition = {
      ...base,
      tokens: [
        { type: "note", pitch: "A", octave: 4, accidental: null, duration: "quarter" },
        { type: "note", pitch: "B", octave: 4, accidental: null, duration: "quarter" },
      ],
      voices: [{ name: "Baixo", tokens: [{ type: "note", pitch: "A", octave: 3, accidental: null, duration: "half" }] }],
      lyrics: ["Je-sus mu-dou"],
    };
    expect(roundTrip(composition)).toBe(compositionToAbc(composition));
    const parsed = parseAbcToComposition(compositionToAbc(composition));
    if ("error" in parsed) throw new Error(parsed.error);
    expect(parsed.composition.lyrics).toEqual(["Je-sus mu-dou"]);
    expect(parsed.composition.voices?.[0].name).toBe("Baixo");
  });

  it("preserva tom, compasso e andamento do cabeçalho", () => {
    const composition: NotationComposition = {
      key: "D",
      timeSignature: "3/4",
      bpm: 120,
      showNoteNames: false,
      tokens: [{ type: "note", pitch: "D", octave: 4, accidental: null, duration: "quarter" }],
    };
    const result = parseAbcToComposition(compositionToAbc(composition));
    if ("error" in result) throw new Error(result.error);
    expect(result.composition.key).toBe("D");
    expect(result.composition.timeSignature).toBe("3/4");
    expect(result.composition.bpm).toBe(120);
  });
});

describe("parseAbcToComposition — erros e avisos", () => {
  it("recusa texto vazio", () => {
    expect(parseAbcToComposition("   ")).toEqual({ error: expect.any(String) });
  });

  it("recusa ABC sem nenhuma nota", () => {
    const result = parseAbcToComposition("X:1\nK:C\n");
    expect("error" in result).toBe(true);
  });

  it("aceita um corpo ABC solto, sem cabeçalho", () => {
    const result = parseAbcToComposition("A B c d");
    expect("error" in result).toBe(false);
    if ("error" in result) return;
    expect(result.composition.tokens.filter((token) => token.type === "note")).toHaveLength(4);
  });

  it("avisa e cai no padrão quando o tom não é suportado", () => {
    const result = parseAbcToComposition("X:1\nM:4/4\nL:1/8\nK:C#\nC2");
    if ("error" in result) throw new Error("esperava sucesso com aviso");
    expect(result.composition.key).toBe("C");
    expect(result.warnings.join(" ")).toMatch(/tonalidade/i);
  });

  it("reduz acorde à nota mais grave, com aviso", () => {
    const result = parseAbcToComposition("X:1\nM:4/4\nL:1/8\nK:C\n[CEG]2");
    if ("error" in result) throw new Error("esperava sucesso");
    const notes = result.composition.tokens.filter((token) => token.type === "note");
    expect(notes).toHaveLength(1);
    expect(result.warnings.join(" ")).toMatch(/acorde/i);
  });
});
