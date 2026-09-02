import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@venore/plugin-sdk/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const findQuizQuestionById = vi.fn();
const updateQuizQuestion = vi.fn();

vi.mock("./store", () => ({
  findQuizQuestionById: (...args: unknown[]) => findQuizQuestionById(...args),
  updateQuizQuestion: (...args: unknown[]) => updateQuizQuestion(...args),
}));

const existingQuestion = {
  id: "question-1",
  lessonId: "lesson-1",
  text: "2 + 2?",
  options: ["3", "4"],
  optionNotations: null,
  correctOptionIndex: 1,
  questionKind: "text" as const,
  promptNotation: null,
  createdAt: new Date(),
};

describe("updateQuizQuestionService", () => {
  beforeEach(() => {
    findQuizQuestionById.mockReset();
    updateQuizQuestion.mockReset();
  });

  it("fails when the quiz question does not exist", async () => {
    findQuizQuestionById.mockResolvedValue(null);

    const { updateQuizQuestionService } = await import("./service");
    const result = await updateQuizQuestionService({ id: "missing", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.quiz.not_found", message: expect.any(String) },
    });
    expect(updateQuizQuestion).not.toHaveBeenCalled();
  });

  it("fails when the resulting correctOptionIndex falls outside the final options list", async () => {
    findQuizQuestionById.mockResolvedValue(existingQuestion);

    const { updateQuizQuestionService } = await import("./service");
    const result = await updateQuizQuestionService({
      id: "question-1",
      options: ["only one option is not enough, but here two"],
      actorId: "actor-1",
    });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.quiz.invalid_correct_option", message: expect.any(String) },
    });
    expect(updateQuizQuestion).not.toHaveBeenCalled();
  });

  it("updates the quiz question when the final state is valid", async () => {
    findQuizQuestionById.mockResolvedValue(existingQuestion);
    updateQuizQuestion.mockResolvedValue({ ...existingQuestion, text: "3 + 3?" });

    const { updateQuizQuestionService } = await import("./service");
    const result = await updateQuizQuestionService({ id: "question-1", text: "3 + 3?", actorId: "actor-1" });

    expect(result.success).toBe(true);
    expect(updateQuizQuestion).toHaveBeenCalledWith("question-1", {
      text: "3 + 3?",
      options: undefined,
      optionNotations: undefined,
      correctOptionIndex: undefined,
      questionKind: undefined,
      promptNotation: undefined,
    });
  });

  it("recusa virar 'audio' sem nenhuma notação no estado final", async () => {
    findQuizQuestionById.mockResolvedValue(existingQuestion);

    const { updateQuizQuestionService } = await import("./service");
    const result = await updateQuizQuestionService({ id: "question-1", questionKind: "audio", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.quiz.audio_requires_notation", message: expect.any(String) },
    });
    expect(updateQuizQuestion).not.toHaveBeenCalled();
  });

  it("aceita virar 'audio' quando o patch traz um enunciado tocável", async () => {
    findQuizQuestionById.mockResolvedValue(existingQuestion);
    updateQuizQuestion.mockResolvedValue({ ...existingQuestion, questionKind: "audio", promptNotation: "X:1\nK:A\nA c" });

    const { updateQuizQuestionService } = await import("./service");
    const result = await updateQuizQuestionService({
      id: "question-1",
      questionKind: "audio",
      promptNotation: "X:1\nK:A\nA c",
      actorId: "actor-1",
    });

    expect(result.success).toBe(true);
  });
});
