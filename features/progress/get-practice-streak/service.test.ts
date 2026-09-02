import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const findPracticeDays = vi.fn();

vi.mock("../../../shared/practice-streak-store", () => ({
  findPracticeDays: (...args: unknown[]) => findPracticeDays(...args),
}));

describe("getPracticeStreak", () => {
  beforeEach(() => {
    findPracticeDays.mockReset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-01T09:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("lê os dias de prática numa janela de 60 dias e devolve a ofensiva calculada", async () => {
    findPracticeDays.mockResolvedValue(["2026-08-30", "2026-08-31", "2026-09-01"]);

    const { getPracticeStreak } = await import("./service");
    const result = await getPracticeStreak({ actorId: "actor-1" });

    expect(findPracticeDays).toHaveBeenCalledWith("actor-1", "2026-07-03");
    expect(result).toEqual({
      success: true,
      data: { current: 3, longest: 3, practicedToday: true, lastDay: "2026-09-01" },
    });
  });

  it("devolve ofensiva zerada (sem erro) quando não há nenhum dia registrado", async () => {
    findPracticeDays.mockResolvedValue([]);

    const { getPracticeStreak } = await import("./service");
    const result = await getPracticeStreak({ actorId: "actor-1" });

    expect(result).toEqual({
      success: true,
      data: { current: 0, longest: 0, practicedToday: false, lastDay: null },
    });
  });
});
