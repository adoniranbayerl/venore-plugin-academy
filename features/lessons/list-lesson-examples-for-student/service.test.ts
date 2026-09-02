import { beforeEach, describe, expect, it, vi } from "vitest";

const isEnrolled = vi.fn();
vi.mock("../../../shared/enrollment", () => ({
  isEnrolled: (...args: unknown[]) => isEnrolled(...args),
}));

const isLessonAccessible = vi.fn();
vi.mock("../../../shared/lesson-progress", () => ({
  isLessonAccessible: (...args: unknown[]) => isLessonAccessible(...args),
}));

const findLessonById = vi.fn();
const findLessonExamplesByLesson = vi.fn();

vi.mock("./store", () => ({
  findLessonById: (...args: unknown[]) => findLessonById(...args),
  findLessonExamplesByLesson: (...args: unknown[]) => findLessonExamplesByLesson(...args),
}));

describe("listLessonExamplesForStudent", () => {
  beforeEach(() => {
    isEnrolled.mockReset();
    isLessonAccessible.mockReset();
    findLessonById.mockReset();
    findLessonExamplesByLesson.mockReset();
  });

  it("fails when the lesson does not exist", async () => {
    findLessonById.mockResolvedValue(null);

    const { listLessonExamplesForStudent } = await import("./service");
    const result = await listLessonExamplesForStudent({ lessonId: "missing", actorId: "actor-1" });

    expect(result).toEqual({ success: false, error: { code: "academy.lessons.not_found", message: expect.any(String) } });
  });

  it("fails when the actor is not enrolled", async () => {
    findLessonById.mockResolvedValue({ id: "lesson-1", courseId: "course-1" });
    isEnrolled.mockResolvedValue(false);

    const { listLessonExamplesForStudent } = await import("./service");
    const result = await listLessonExamplesForStudent({ lessonId: "lesson-1", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.enrollments.not_enrolled", message: expect.any(String) },
    });
  });

  it("fails when the lesson is locked", async () => {
    findLessonById.mockResolvedValue({ id: "lesson-1", courseId: "course-1" });
    isEnrolled.mockResolvedValue(true);
    isLessonAccessible.mockResolvedValue(false);

    const { listLessonExamplesForStudent } = await import("./service");
    const result = await listLessonExamplesForStudent({ lessonId: "lesson-1", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.progress.lesson_locked", message: expect.any(String) },
    });
  });

  it("returns the examples when enrolled and accessible", async () => {
    findLessonById.mockResolvedValue({ id: "lesson-1", courseId: "course-1" });
    isEnrolled.mockResolvedValue(true);
    isLessonAccessible.mockResolvedValue(true);
    findLessonExamplesByLesson.mockResolvedValue([{ id: "example-1" }]);

    const { listLessonExamplesForStudent } = await import("./service");
    const result = await listLessonExamplesForStudent({ lessonId: "lesson-1", actorId: "actor-1" });

    expect(result).toEqual({ success: true, data: [{ id: "example-1" }] });
  });
});
