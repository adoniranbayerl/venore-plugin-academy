import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@venore/plugin-sdk/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const findCourseById = vi.fn();
const markCoursePublished = vi.fn();
const findLessonsWithQuizFlagByCourse = vi.fn();
const countQuizQuestionsByLessonIds = vi.fn();

vi.mock("./store", () => ({
  findCourseById: (...args: unknown[]) => findCourseById(...args),
  markCoursePublished: (...args: unknown[]) => markCoursePublished(...args),
  findLessonsWithQuizFlagByCourse: (...args: unknown[]) => findLessonsWithQuizFlagByCourse(...args),
  countQuizQuestionsByLessonIds: (...args: unknown[]) => countQuizQuestionsByLessonIds(...args),
}));

const publishedLesson = (overrides: Partial<{ id: string; position: number; quizEnabled: boolean }> = {}) => ({
  id: "lesson-1",
  position: 1,
  quizEnabled: false,
  ...overrides,
});

describe("publishCourse", () => {
  beforeEach(() => {
    findCourseById.mockReset();
    markCoursePublished.mockReset();
    findLessonsWithQuizFlagByCourse.mockReset();
    countQuizQuestionsByLessonIds.mockReset();

    countQuizQuestionsByLessonIds.mockResolvedValue(new Map());
  });

  it("publishes a course as restricted with a lesson", async () => {
    findCourseById.mockResolvedValue({ id: "course-1", status: "draft" });
    findLessonsWithQuizFlagByCourse.mockResolvedValue([publishedLesson()]);
    markCoursePublished.mockResolvedValue({ id: "course-1", status: "restricted" });

    const { publishCourse } = await import("./service");
    const result = await publishCourse({ id: "course-1", status: "restricted", actorId: "actor-1" });

    expect(result).toEqual({ success: true, data: { id: "course-1", status: "restricted" } });
    expect(markCoursePublished).toHaveBeenCalledWith("course-1", "restricted");
  });

  it("publishes a course as public with a lesson", async () => {
    findCourseById.mockResolvedValue({ id: "course-1", status: "draft" });
    findLessonsWithQuizFlagByCourse.mockResolvedValue([publishedLesson()]);
    markCoursePublished.mockResolvedValue({ id: "course-1", status: "public" });

    const { publishCourse } = await import("./service");
    const result = await publishCourse({ id: "course-1", status: "public", actorId: "actor-1" });

    expect(result).toEqual({ success: true, data: { id: "course-1", status: "public" } });
    expect(markCoursePublished).toHaveBeenCalledWith("course-1", "public");
  });

  it("fails when the course does not exist", async () => {
    findCourseById.mockResolvedValue(null);

    const { publishCourse } = await import("./service");
    const result = await publishCourse({ id: "missing", status: "public", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.courses.not_found", message: expect.any(String) },
    });
    expect(markCoursePublished).not.toHaveBeenCalled();
  });

  it("fails when the course has no lessons", async () => {
    findCourseById.mockResolvedValue({ id: "course-1", status: "draft" });
    findLessonsWithQuizFlagByCourse.mockResolvedValue([]);

    const { publishCourse } = await import("./service");
    const result = await publishCourse({ id: "course-1", status: "public", actorId: "actor-1" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("academy.courses.publish_validation_failed");
      expect(result.error.message).toContain("pelo menos uma aula");
    }
    expect(markCoursePublished).not.toHaveBeenCalled();
  });

  it("fails when a quiz-enabled lesson has no questions", async () => {
    findCourseById.mockResolvedValue({ id: "course-1", status: "draft" });
    findLessonsWithQuizFlagByCourse.mockResolvedValue([publishedLesson({ quizEnabled: true })]);
    countQuizQuestionsByLessonIds.mockResolvedValue(new Map());

    const { publishCourse } = await import("./service");
    const result = await publishCourse({ id: "course-1", status: "public", actorId: "actor-1" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain("quiz habilitado sem nenhuma pergunta");
    }
    expect(markCoursePublished).not.toHaveBeenCalled();
  });

  it("reports every quiz-without-questions problem found, not just the first", async () => {
    findCourseById.mockResolvedValue({ id: "course-1", status: "draft" });
    findLessonsWithQuizFlagByCourse.mockResolvedValue([
      publishedLesson({ id: "lesson-1", position: 1, quizEnabled: true }),
      publishedLesson({ id: "lesson-2", position: 2, quizEnabled: true }),
    ]);
    countQuizQuestionsByLessonIds.mockResolvedValue(new Map());

    const { publishCourse } = await import("./service");
    const result = await publishCourse({ id: "course-1", status: "public", actorId: "actor-1" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain("Aula 1");
      expect(result.error.message).toContain("Aula 2");
      expect(result.error.message).toContain("quiz habilitado sem nenhuma pergunta");
    }
    expect(markCoursePublished).not.toHaveBeenCalled();
  });
});
