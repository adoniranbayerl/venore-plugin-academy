import { describe, expect, it } from "vitest";
import { DURATION_KEYS, nearestOctave, PITCH_KEYS, resolveTypedNote } from "./notation-keyboard";

describe("nearestOctave", () => {
  it("cai na oitava 4 sem nota anterior", () => {
    expect(nearestOctave("C", null)).toBe(4);
  });

  it("mantém a oitava quando o salto já é pequeno (C4 -> D)", () => {
    expect(nearestOctave("D", { pitch: "C", octave: 4 })).toBe(4);
  });

  it("sobe de oitava quando fica mais perto (B4 -> C sobe pra 5)", () => {
    expect(nearestOctave("C", { pitch: "B", octave: 4 })).toBe(5);
  });

  it("desce de oitava quando fica mais perto (C4 -> B desce pra 3)", () => {
    expect(nearestOctave("B", { pitch: "C", octave: 4 })).toBe(3);
  });
});

describe("resolveTypedNote", () => {
  it("aplica o acidente pendente e mantém a oitava próxima", () => {
    expect(resolveTypedNote("F", { pitch: "E", octave: 4 }, "sharp", { min: 2, max: 6 })).toEqual({
      pitch: "F",
      octave: 4,
      accidental: "sharp",
    });
  });

  it("prende a oitava no topo do range do editor", () => {
    const note = resolveTypedNote("C", { pitch: "A", octave: 6 }, null, { min: 2, max: 6 });
    expect(note.octave).toBe(6);
    expect(note.accidental).toBeNull();
  });

  it("prende a oitava no fundo do range do editor", () => {
    const note = resolveTypedNote("B", { pitch: "C", octave: 2 }, null, { min: 2, max: 6 });
    expect(note.octave).toBe(2);
  });
});

describe("mapas de tecla", () => {
  it("1 = semibreve, 3 = semínima, 5 = semicolcheia", () => {
    expect(DURATION_KEYS["1"]).toBe("whole");
    expect(DURATION_KEYS["3"]).toBe("quarter");
    expect(DURATION_KEYS["5"]).toBe("sixteenth");
  });

  it("a..g mapeiam as sete alturas, b = Si", () => {
    expect(PITCH_KEYS.a).toBe("A");
    expect(PITCH_KEYS.b).toBe("B");
    expect(PITCH_KEYS.g).toBe("G");
  });
});
