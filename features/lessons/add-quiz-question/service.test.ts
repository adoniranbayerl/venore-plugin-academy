import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@venore/plugin-sdk/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const findLessonById = vi.fn();
const insertQuizQuestion = vi.fn();

vi.mock("./store", () => ({
  findLessonById: (...args: unknown[]) => findLessonById(...args),
  insertQuizQuestion: (...args: unknown[]) => insertQuizQuestion(...args),
}));

describe("addQuizQuestion", () => {
  beforeEach(() => {
    findLessonById.mockReset();
    insertQuizQuestion.mockReset();
  });

  it("fails when the lesson does not exist", async () => {
    findLessonById.mockResolvedValue(null);

    const { addQuizQuestion } = await import("./service");
    const result = await addQuizQuestion({
      lessonId: "missing",
      text: "1+1?",
      options: ["1", "2"],
      correctOptionIndex: 1,
      actorId: "actor-1",
    });

    expect(result).toEqual({ success: false, error: { code: "academy.lessons.not_found", message: expect.any(String) } });
    expect(insertQuizQuestion).not.toHaveBeenCalled();
  });

  it("inserts the question when the lesson exists", async () => {
    findLessonById.mockResolvedValue({ id: "lesson-1" });
    insertQuizQuestion.mockResolvedValue({
      id: "q1",
      lessonId: "lesson-1",
      text: "1+1?",
      options: ["1", "2"],
      correctOptionIndex: 1,
      createdAt: new Date(),
    });

    const { addQuizQuestion } = await import("./service");
    const result = await addQuizQuestion({
      lessonId: "lesson-1",
      text: "1+1?",
      options: ["1", "2"],
      correctOptionIndex: 1,
      actorId: "actor-1",
    });

    expect(result.success).toBe(true);
  });
});
