import { beforeEach, describe, expect, it, vi } from "vitest";

const isLessonAccessible = vi.fn();
const findCompletedMaterialIds = vi.fn();

vi.mock("../../../shared/lesson-progress", () => ({
  isLessonAccessible: (...args: unknown[]) => isLessonAccessible(...args),
  findCompletedMaterialIds: (...args: unknown[]) => findCompletedMaterialIds(...args),
}));

const isEnrolled = vi.fn();

vi.mock("../../../shared/enrollment", () => ({
  isEnrolled: (...args: unknown[]) => isEnrolled(...args),
}));

const findLessonById = vi.fn();
const findLessonMaterialsByLesson = vi.fn();

vi.mock("./store", () => ({
  findLessonById: (...args: unknown[]) => findLessonById(...args),
  findLessonMaterialsByLesson: (...args: unknown[]) => findLessonMaterialsByLesson(...args),
}));

const lesson = { id: "lesson-1", courseId: "course-1", position: 1 };

describe("listLessonMaterialsForStudent", () => {
  beforeEach(() => {
    findLessonById.mockReset();
    isLessonAccessible.mockReset();
    isEnrolled.mockReset();
    findLessonMaterialsByLesson.mockReset();
    findCompletedMaterialIds.mockReset();

    findLessonById.mockResolvedValue(lesson);
    isEnrolled.mockResolvedValue(true);
    isLessonAccessible.mockResolvedValue(true);
    findCompletedMaterialIds.mockResolvedValue(new Set());
  });

  it("fails when the lesson does not exist", async () => {
    findLessonById.mockResolvedValue(null);

    const { listLessonMaterialsForStudent } = await import("./service");
    const result = await listLessonMaterialsForStudent({ lessonId: "missing", actorId: "actor-1" });

    expect(result).toEqual({ success: false, error: { code: "academy.lessons.not_found", message: expect.any(String) } });
  });

  it("fails when the actor is not enrolled", async () => {
    isEnrolled.mockResolvedValue(false);

    const { listLessonMaterialsForStudent } = await import("./service");
    const result = await listLessonMaterialsForStudent({ lessonId: "lesson-1", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.enrollments.not_enrolled", message: expect.any(String) },
    });
    expect(isLessonAccessible).not.toHaveBeenCalled();
  });

  it("fails when the lesson is locked", async () => {
    isLessonAccessible.mockResolvedValue(false);

    const { listLessonMaterialsForStudent } = await import("./service");
    const result = await listLessonMaterialsForStudent({ lessonId: "lesson-1", actorId: "actor-1" });

    expect(result).toEqual({ success: false, error: { code: "academy.progress.lesson_locked", message: expect.any(String) } });
  });

  it("returns the materials annotated with the actor's own completion", async () => {
    const materials = [
      { id: "material-1", lessonId: "lesson-1", mediaId: "media-1", label: "Slides", position: 1, createdAt: new Date() },
    ];
    findLessonMaterialsByLesson.mockResolvedValue(materials);
    findCompletedMaterialIds.mockResolvedValue(new Set(["material-1"]));

    const { listLessonMaterialsForStudent } = await import("./service");
    const result = await listLessonMaterialsForStudent({ lessonId: "lesson-1", actorId: "actor-1" });

    expect(result).toEqual({ success: true, data: [{ ...materials[0], completed: true }] });
  });
});
