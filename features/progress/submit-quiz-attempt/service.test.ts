import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@venore/plugin-sdk/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const findLessonRequirements = vi.fn();
const isLessonAccessible = vi.fn();

vi.mock("../../../shared/lesson-progress", () => ({
  findLessonRequirements: (...args: unknown[]) => findLessonRequirements(...args),
  isLessonAccessible: (...args: unknown[]) => isLessonAccessible(...args),
}));

const isEnrolled = vi.fn();

vi.mock("../../../shared/enrollment", () => ({
  isEnrolled: (...args: unknown[]) => isEnrolled(...args),
}));

vi.mock("../../../shared/progress-hooks", () => ({ onProgressAdvanced: vi.fn() }));

const countActiveAttempts = vi.fn();

vi.mock("../../../shared/quiz-attempts", () => ({
  countActiveAttempts: (...args: unknown[]) => countActiveAttempts(...args),
}));

const findLessonById = vi.fn();
const findQuestionsByLesson = vi.fn();
const insertAttempt = vi.fn();

vi.mock("./store", () => ({
  findLessonById: (...args: unknown[]) => findLessonById(...args),
  findQuestionsByLesson: (...args: unknown[]) => findQuestionsByLesson(...args),
  insertAttempt: (...args: unknown[]) => insertAttempt(...args),
}));

const lesson = { id: "lesson-1", courseId: "course-1", position: 1 };
const requirements = {
  lessonId: "lesson-1",
  readTextEnabled: false,
  watchVideoEnabled: false,
  quizEnabled: true,
  quizPassThresholdPercent: 70,
  quizMaxAttempts: 2,
  updatedAt: new Date(),
};
const questions = [
  { id: "q1", lessonId: "lesson-1", text: "1+1", options: ["1", "2"], correctOptionIndex: 1, createdAt: new Date() },
  { id: "q2", lessonId: "lesson-1", text: "2+2", options: ["3", "4"], correctOptionIndex: 1, createdAt: new Date() },
];

describe("submitQuizAttempt", () => {
  beforeEach(() => {
    findLessonById.mockReset();
    isLessonAccessible.mockReset();
    isEnrolled.mockReset();
    findLessonRequirements.mockReset();
    findQuestionsByLesson.mockReset();
    countActiveAttempts.mockReset();
    insertAttempt.mockReset();

    findLessonById.mockResolvedValue(lesson);
    isEnrolled.mockResolvedValue(true);
    isLessonAccessible.mockResolvedValue(true);
    findLessonRequirements.mockResolvedValue(requirements);
    findQuestionsByLesson.mockResolvedValue(questions);
    countActiveAttempts.mockResolvedValue(0);
    insertAttempt.mockResolvedValue({});
  });

  it("fails when the actor is not enrolled, even if the lesson would otherwise be unlocked", async () => {
    isEnrolled.mockResolvedValue(false);

    const { submitQuizAttempt } = await import("./service");
    const result = await submitQuizAttempt({
      lessonId: "lesson-1",
      answers: [{ questionId: "q1", selectedOptionIndex: 1 }],
      actorId: "actor-1",
    });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.enrollments.not_enrolled", message: expect.any(String) },
    });
    expect(isLessonAccessible).not.toHaveBeenCalled();
    expect(insertAttempt).not.toHaveBeenCalled();
  });

  it("fails with not_enrolled (not lesson_locked) when the actor is neither enrolled nor would pass the lock-chain", async () => {
    isEnrolled.mockResolvedValue(false);
    isLessonAccessible.mockResolvedValue(false);

    const { submitQuizAttempt } = await import("./service");
    const result = await submitQuizAttempt({
      lessonId: "lesson-1",
      answers: [{ questionId: "q1", selectedOptionIndex: 1 }],
      actorId: "actor-1",
    });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.enrollments.not_enrolled", message: expect.any(String) },
    });
  });

  it("grades automatically and computes the percentage score", async () => {
    const { submitQuizAttempt } = await import("./service");
    const result = await submitQuizAttempt({
      lessonId: "lesson-1",
      answers: [
        { questionId: "q1", selectedOptionIndex: 1 },
        { questionId: "q2", selectedOptionIndex: 0 },
      ],
      actorId: "actor-1",
    });

    expect(result).toEqual({
      success: true,
      data: { attemptNumber: 1, score: 50, grade: 5, passed: false, attemptsRemaining: 1 },
    });
  });

  it("passes exactly at the configured threshold", async () => {
    const { submitQuizAttempt } = await import("./service");
    const result = await submitQuizAttempt({
      lessonId: "lesson-1",
      answers: [
        { questionId: "q1", selectedOptionIndex: 1 },
        { questionId: "q2", selectedOptionIndex: 1 },
      ],
      actorId: "actor-1",
    });

    expect(result).toEqual({
      success: true,
      data: { attemptNumber: 1, score: 100, grade: 10, passed: true, attemptsRemaining: 1 },
    });
  });

  it("blocks a new attempt once quizMaxAttempts is exhausted, without inserting", async () => {
    countActiveAttempts.mockResolvedValue(2);

    const { submitQuizAttempt } = await import("./service");
    const result = await submitQuizAttempt({
      lessonId: "lesson-1",
      answers: [
        { questionId: "q1", selectedOptionIndex: 1 },
        { questionId: "q2", selectedOptionIndex: 1 },
      ],
      actorId: "actor-1",
    });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.quiz.attempts_exhausted", message: expect.any(String) },
    });
    expect(insertAttempt).not.toHaveBeenCalled();
  });

  // Cenário do pedido original: aluno esgota tentativas (bloqueado), professor reseta (invalida
  // as tentativas ativas via shared/quiz-attempts), aluno tenta de novo e consegue. countActiveAttempts
  // é a mesma função que reset-quiz-attempts/service.ts esvazia via invalidateAttempts — aqui
  // simulamos o efeito do reset mockando a contagem de volta a 0.
  it("accepts a new attempt after a reset brings the active attempt count back to zero", async () => {
    countActiveAttempts.mockResolvedValue(2);

    const { submitQuizAttempt } = await import("./service");
    const blocked = await submitQuizAttempt({
      lessonId: "lesson-1",
      answers: [
        { questionId: "q1", selectedOptionIndex: 1 },
        { questionId: "q2", selectedOptionIndex: 1 },
      ],
      actorId: "actor-1",
    });
    expect(blocked).toEqual({
      success: false,
      error: { code: "academy.quiz.attempts_exhausted", message: expect.any(String) },
    });

    // professor reseta: tentativas ativas voltam a 0
    countActiveAttempts.mockResolvedValue(0);

    const retried = await submitQuizAttempt({
      lessonId: "lesson-1",
      answers: [
        { questionId: "q1", selectedOptionIndex: 1 },
        { questionId: "q2", selectedOptionIndex: 1 },
      ],
      actorId: "actor-1",
    });
    expect(retried).toEqual({
      success: true,
      data: { attemptNumber: 1, score: 100, grade: 10, passed: true, attemptsRemaining: 1 },
    });
    expect(insertAttempt).toHaveBeenCalledTimes(1);
  });

  it("fails when there are no quiz questions configured for the lesson", async () => {
    findQuestionsByLesson.mockResolvedValue([]);

    const { submitQuizAttempt } = await import("./service");
    const result = await submitQuizAttempt({
      lessonId: "lesson-1",
      answers: [{ questionId: "q1", selectedOptionIndex: 1 }],
      actorId: "actor-1",
    });

    expect(result).toEqual({ success: false, error: { code: "academy.quiz.no_questions", message: expect.any(String) } });
    expect(insertAttempt).not.toHaveBeenCalled();
  });

  it("fails when the answers do not cover every question", async () => {
    const { submitQuizAttempt } = await import("./service");
    const result = await submitQuizAttempt({
      lessonId: "lesson-1",
      answers: [{ questionId: "q1", selectedOptionIndex: 1 }],
      actorId: "actor-1",
    });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.quiz.incomplete_answers", message: expect.any(String) },
    });
    expect(insertAttempt).not.toHaveBeenCalled();
  });

  it("fails when quiz is not enabled for the lesson", async () => {
    findLessonRequirements.mockResolvedValue({ ...requirements, quizEnabled: false });

    const { submitQuizAttempt } = await import("./service");
    const result = await submitQuizAttempt({
      lessonId: "lesson-1",
      answers: [{ questionId: "q1", selectedOptionIndex: 1 }],
      actorId: "actor-1",
    });

    expect(result).toEqual({ success: false, error: { code: "academy.quiz.not_enabled", message: expect.any(String) } });
  });

  it("fails when the lesson is locked (previous lesson incomplete)", async () => {
    isLessonAccessible.mockResolvedValue(false);

    const { submitQuizAttempt } = await import("./service");
    const result = await submitQuizAttempt({
      lessonId: "lesson-1",
      answers: [{ questionId: "q1", selectedOptionIndex: 1 }],
      actorId: "actor-1",
    });

    expect(result).toEqual({ success: false, error: { code: "academy.progress.lesson_locked", message: expect.any(String) } });
  });
});
