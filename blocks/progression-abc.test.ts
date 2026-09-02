import { parseOnly } from "abcjs";
import { describe, expect, it } from "vitest";
import { parseChordSymbol, parseProgression, progressionToAbc } from "./progression-abc";

describe("parseChordSymbol", () => {
  it("tríade maior", () => {
    expect(parseChordSymbol("A")).toEqual({ rootSemitone: 9, intervals: [0, 4, 7], bassSemitone: 9 });
  });

  it("tríade menor", () => {
    expect(parseChordSymbol("F#m")).toEqual({ rootSemitone: 6, intervals: [0, 3, 7], bassSemitone: 6 });
  });

  it("sétima da dominante", () => {
    expect(parseChordSymbol("E7")?.intervals).toEqual([0, 4, 7, 10]);
  });

  it("acorde com baixo invertido", () => {
    const parsed = parseChordSymbol("D/F#");
    expect(parsed?.rootSemitone).toBe(2);
    expect(parsed?.bassSemitone).toBe(6);
  });

  it("recusa lixo", () => {
    expect(parseChordSymbol("xyz")).toBeNull();
    expect(parseChordSymbol("Hm")).toBeNull();
  });
});

describe("parseProgression", () => {
  it("usa o default de tempos e aceita override por :n", () => {
    expect(parseProgression("A D E7:2 A:2", 4)).toEqual([
      { symbol: "A", beats: 4 },
      { symbol: "D", beats: 4 },
      { symbol: "E7", beats: 2 },
      { symbol: "A", beats: 2 },
    ]);
  });

  it("ignora espaços extras", () => {
    expect(parseProgression("  A   D  ", 4)).toHaveLength(2);
  });
});

describe("progressionToAbc", () => {
  it("gera um cabeçalho com tom e andamento e um acorde por bloco", () => {
    const abc = progressionToAbc({ chords: parseProgression("A D E7 A", 4), key: "A", bpm: 96 });
    expect(abc).toContain("Q:1/4=96");
    expect(abc).toContain("K:A");
    expect(abc).toMatch(/\[[\^_=A-Ga-g,']+\]4/); // um acorde de 4 tempos
    expect(abc).toContain("|"); // pelo menos uma barra de compasso
  });

  it("cifra desconhecida vira pausa, mantendo o tempo", () => {
    const abc = progressionToAbc({ chords: parseProgression("A zzz A A", 4), key: "C", bpm: 90 });
    expect(abc).toContain("z4");
  });

  it("o ABC gerado é válido pro abcjs e cada acorde tem várias notas", () => {
    const abc = progressionToAbc({ chords: parseProgression("A F#m D E7 A", 4), key: "A", bpm: 96 });
    const tune = parseOnly(abc)[0] as { lines?: { staff?: { voices?: { el_type?: string; pitches?: unknown[] }[][] }[] }[] };
    const voice = tune.lines?.find((line) => line.staff)?.staff?.[0]?.voices?.[0] ?? [];
    const chordEls = voice.filter((element) => element.el_type === "note" && (element.pitches?.length ?? 0) > 1);
    expect(chordEls.length).toBeGreaterThanOrEqual(4);
  });
});
