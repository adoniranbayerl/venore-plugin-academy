import { beforeEach, describe, expect, it, vi } from "vitest";

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

const findLessonById = vi.fn();
const findQuizQuestionsByLesson = vi.fn();

vi.mock("./store", () => ({
  findLessonById: (...args: unknown[]) => findLessonById(...args),
  findQuizQuestionsByLesson: (...args: unknown[]) => findQuizQuestionsByLesson(...args),
}));

const lesson = { id: "lesson-1", courseId: "course-1", position: 1 };

describe("listQuizQuestionsForStudent", () => {
  beforeEach(() => {
    findLessonById.mockReset();
    isLessonAccessible.mockReset();
    isEnrolled.mockReset();
    findLessonRequirements.mockReset();
    findQuizQuestionsByLesson.mockReset();

    findLessonById.mockResolvedValue(lesson);
    isEnrolled.mockResolvedValue(true);
    isLessonAccessible.mockResolvedValue(true);
    findLessonRequirements.mockResolvedValue({ quizEnabled: true });
  });

  it("fails when the actor is not enrolled, even if the lesson would otherwise be unlocked", async () => {
    isEnrolled.mockResolvedValue(false);

    const { listQuizQuestionsForStudent } = await import("./service");
    const result = await listQuizQuestionsForStudent({ lessonId: "lesson-1", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.enrollments.not_enrolled", message: expect.any(String) },
    });
    expect(isLessonAccessible).not.toHaveBeenCalled();
  });

  it("fails with not_enrolled (not lesson_locked) when the actor is neither enrolled nor would pass the lock-chain", async () => {
    isEnrolled.mockResolvedValue(false);
    isLessonAccessible.mockResolvedValue(false);

    const { listQuizQuestionsForStudent } = await import("./service");
    const result = await listQuizQuestionsForStudent({ lessonId: "lesson-1", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.enrollments.not_enrolled", message: expect.any(String) },
    });
  });

  it("fails when the lesson does not exist", async () => {
    findLessonById.mockResolvedValue(null);

    const { listQuizQuestionsForStudent } = await import("./service");
    const result = await listQuizQuestionsForStudent({ lessonId: "missing", actorId: "actor-1" });

    expect(result).toEqual({ success: false, error: { code: "academy.lessons.not_found", message: expect.any(String) } });
  });

  it("fails when the lesson is locked", async () => {
    isLessonAccessible.mockResolvedValue(false);

    const { listQuizQuestionsForStudent } = await import("./service");
    const result = await listQuizQuestionsForStudent({ lessonId: "lesson-1", actorId: "actor-1" });

    expect(result).toEqual({ success: false, error: { code: "academy.progress.lesson_locked", message: expect.any(String) } });
  });

  it("fails when the quiz is not enabled", async () => {
    findLessonRequirements.mockResolvedValue({ quizEnabled: false });

    const { listQuizQuestionsForStudent } = await import("./service");
    const result = await listQuizQuestionsForStudent({ lessonId: "lesson-1", actorId: "actor-1" });

    expect(result).toEqual({ success: false, error: { code: "academy.quiz.not_enabled", message: expect.any(String) } });
  });

  it("strips correctOptionIndex from every question", async () => {
    findQuizQuestionsByLesson.mockResolvedValue([
      { id: "q-1", lessonId: "lesson-1", text: "2+2?", options: ["3", "4"], correctOptionIndex: 1, createdAt: new Date() },
    ]);

    const { listQuizQuestionsForStudent } = await import("./service");
    const result = await listQuizQuestionsForStudent({ lessonId: "lesson-1", actorId: "actor-1" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual([{ id: "q-1", lessonId: "lesson-1", text: "2+2?", options: ["3", "4"], createdAt: expect.any(Date) }]);
      expect(result.data[0]).not.toHaveProperty("correctOptionIndex");
    }
  });
});
