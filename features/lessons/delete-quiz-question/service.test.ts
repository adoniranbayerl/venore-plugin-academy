import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@venore/plugin-sdk/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const findQuizQuestionById = vi.fn();
const findQuizAttemptsByLesson = vi.fn();
const deleteQuizQuestion = vi.fn();

vi.mock("./store", () => ({
  findQuizQuestionById: (...args: unknown[]) => findQuizQuestionById(...args),
  findQuizAttemptsByLesson: (...args: unknown[]) => findQuizAttemptsByLesson(...args),
  deleteQuizQuestion: (...args: unknown[]) => deleteQuizQuestion(...args),
}));

const existingQuestion = {
  id: "question-1",
  lessonId: "lesson-1",
  text: "2 + 2?",
  options: ["3", "4"],
  correctOptionIndex: 1,
  createdAt: new Date(),
};

describe("deleteQuizQuestionService", () => {
  beforeEach(() => {
    findQuizQuestionById.mockReset();
    findQuizAttemptsByLesson.mockReset();
    deleteQuizQuestion.mockReset();
  });

  it("fails when the quiz question does not exist", async () => {
    findQuizQuestionById.mockResolvedValue(null);

    const { deleteQuizQuestionService } = await import("./service");
    const result = await deleteQuizQuestionService({ id: "missing", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.quiz.not_found", message: expect.any(String) },
    });
    expect(deleteQuizQuestion).not.toHaveBeenCalled();
  });

  it("refuses to delete when a student already answered this question", async () => {
    findQuizQuestionById.mockResolvedValue(existingQuestion);
    findQuizAttemptsByLesson.mockResolvedValue([
      {
        id: "attempt-1",
        lessonId: "lesson-1",
        actorId: "student-1",
        attemptNumber: 1,
        score: 100,
        passed: true,
        answers: [{ questionId: "question-1", selectedOptionIndex: 1 }],
        createdAt: new Date(),
        invalidatedAt: null,
      },
    ]);

    const { deleteQuizQuestionService } = await import("./service");
    const result = await deleteQuizQuestionService({ id: "question-1", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.quiz.cannot_delete_has_attempts", message: expect.any(String) },
    });
    expect(deleteQuizQuestion).not.toHaveBeenCalled();
  });

  it("deletes the question when no attempt answered it", async () => {
    findQuizQuestionById.mockResolvedValue(existingQuestion);
    findQuizAttemptsByLesson.mockResolvedValue([
      {
        id: "attempt-1",
        lessonId: "lesson-1",
        actorId: "student-1",
        attemptNumber: 1,
        score: 100,
        passed: true,
        answers: [{ questionId: "other-question", selectedOptionIndex: 0 }],
        createdAt: new Date(),
        invalidatedAt: null,
      },
    ]);
    deleteQuizQuestion.mockResolvedValue(undefined);

    const { deleteQuizQuestionService } = await import("./service");
    const result = await deleteQuizQuestionService({ id: "question-1", actorId: "actor-1" });

    expect(result).toEqual({ success: true, data: { id: "question-1" } });
    expect(deleteQuizQuestion).toHaveBeenCalledWith("question-1");
  });
});
