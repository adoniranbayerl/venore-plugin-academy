import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@venore/plugin-sdk/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const insertExercisePractice = vi.fn();
const getExercisePracticeStats = vi.fn();
vi.mock("../../../shared/exercise-practice-store", () => ({
  insertExercisePractice: (...args: unknown[]) => insertExercisePractice(...args),
  getExercisePracticeStats: (...args: unknown[]) => getExercisePracticeStats(...args),
}));

const recordPracticeDay = vi.fn();
vi.mock("../../../shared/practice-streak-store", () => ({
  recordPracticeDay: (...args: unknown[]) => recordPracticeDay(...args),
}));

describe("recordExercisePractice", () => {
  beforeEach(() => {
    insertExercisePractice.mockReset().mockResolvedValue(undefined);
    getExercisePracticeStats.mockReset().mockResolvedValue({ count: 3, bestScore: 82 });
    recordPracticeDay.mockReset().mockResolvedValue(undefined);
  });

  it("grava a tentativa, marca o dia de prática e devolve a contagem/recorde atualizados", async () => {
    const { recordExercisePractice } = await import("./service");
    const result = await recordExercisePractice({ actorId: "actor-1", exerciseKey: "sing:abc123", score: 75 });

    expect(insertExercisePractice).toHaveBeenCalledWith("actor-1", "sing:abc123", 75);
    expect(recordPracticeDay).toHaveBeenCalledWith("actor-1", expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
    expect(result).toEqual({ success: true, data: { count: 3, bestScore: 82 } });
  });

  it("aceita score null (exercício sem nota)", async () => {
    const { recordExercisePractice } = await import("./service");
    await recordExercisePractice({ actorId: "actor-1", exerciseKey: "sing:abc123", score: null });
    expect(insertExercisePractice).toHaveBeenCalledWith("actor-1", "sing:abc123", null);
  });

  it("não deixa a ofensiva quebrar o registro do exercício", async () => {
    recordPracticeDay.mockRejectedValue(new Error("streak store down"));

    const { recordExercisePractice } = await import("./service");
    const result = await recordExercisePractice({ actorId: "actor-1", exerciseKey: "sing:abc123", score: 90 });

    expect(insertExercisePractice).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });
});
