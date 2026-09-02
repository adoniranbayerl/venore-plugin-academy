import { describe, expect, it } from "vitest";
import { computePracticeStreak } from "./practice-streak";

describe("computePracticeStreak", () => {
  it("devolve ofensiva zerada quando não há dias de prática", () => {
    expect(computePracticeStreak([], "2026-09-01")).toEqual({
      current: 0,
      longest: 0,
      practicedToday: false,
      lastDay: null,
    });
  });

  it("conta dias consecutivos e marca practicedToday", () => {
    const result = computePracticeStreak(["2026-08-30", "2026-08-31", "2026-09-01"], "2026-09-01");
    expect(result.current).toBe(3);
    expect(result.longest).toBe(3);
    expect(result.practicedToday).toBe(true);
    expect(result.lastDay).toBe("2026-09-01");
  });

  it("perdoa UM dia pulado (gap de 2) sem quebrar a sequência", () => {
    // praticou dia 29 e dia 31 (pulou o 30), depois hoje 01 -> 3 dias de prática, ofensiva viva
    const result = computePracticeStreak(["2026-08-29", "2026-08-31", "2026-09-01"], "2026-09-01");
    expect(result.current).toBe(3);
    expect(result.longest).toBe(3);
  });

  it("quebra a sequência quando faltam DOIS dias seguidos (gap de 3)", () => {
    const result = computePracticeStreak(["2026-08-25", "2026-08-28", "2026-08-29"], "2026-08-29");
    // 28 e 29 formam a sequência atual; o 25 ficou pra trás (gap 3)
    expect(result.current).toBe(2);
    expect(result.longest).toBe(2);
  });

  it("esfria a ofensiva atual quando o último dia de prática já passou da janela perdoadora", () => {
    // último dia 28, hoje 01 -> 4 dias de distância, ofensiva esfriou
    const result = computePracticeStreak(["2026-08-27", "2026-08-28"], "2026-09-01");
    expect(result.current).toBe(0);
    expect(result.longest).toBe(2);
    expect(result.practicedToday).toBe(false);
    expect(result.lastDay).toBe("2026-08-28");
  });

  it("mantém a ofensiva viva no limite da janela (praticou anteontem, folga ontem)", () => {
    const result = computePracticeStreak(["2026-08-29", "2026-08-30"], "2026-09-01");
    expect(result.current).toBe(2);
  });

  it("longest reflete a maior sequência histórica mesmo com a atual zerada", () => {
    const days = [
      // sequência longa antiga
      "2026-07-01", "2026-07-02", "2026-07-03", "2026-07-04", "2026-07-05",
      // buraco grande
      "2026-08-20",
    ];
    const result = computePracticeStreak(days, "2026-09-01");
    expect(result.longest).toBe(5);
    expect(result.current).toBe(0);
  });

  it("ignora dias duplicados", () => {
    const result = computePracticeStreak(["2026-09-01", "2026-09-01", "2026-08-31"], "2026-09-01");
    expect(result.current).toBe(2);
    expect(result.longest).toBe(2);
  });

  it("aceita a lista fora de ordem", () => {
    const result = computePracticeStreak(["2026-09-01", "2026-08-30", "2026-08-31"], "2026-09-01");
    expect(result.current).toBe(3);
  });
});
