import { beforeEach, describe, expect, it, vi } from "vitest";

const isLessonAccessible = vi.fn();
const findCompletedSectionIds = vi.fn();

vi.mock("../../../../shared/lesson-progress", () => ({
  isLessonAccessible: (...args: unknown[]) => isLessonAccessible(...args),
  findCompletedSectionIds: (...args: unknown[]) => findCompletedSectionIds(...args),
}));

const isEnrolled = vi.fn();

vi.mock("../../../../shared/enrollment", () => ({
  isEnrolled: (...args: unknown[]) => isEnrolled(...args),
}));

const findLessonById = vi.fn();
const findSectionsByLesson = vi.fn();

vi.mock("./store", () => ({
  findLessonById: (...args: unknown[]) => findLessonById(...args),
  findSectionsByLesson: (...args: unknown[]) => findSectionsByLesson(...args),
}));

const lesson = { id: "lesson-1", courseId: "course-1", position: 1 };

describe("listLessonSectionsForStudent", () => {
  beforeEach(() => {
    findLessonById.mockReset();
    isLessonAccessible.mockReset();
    isEnrolled.mockReset();
    findSectionsByLesson.mockReset();
    findCompletedSectionIds.mockReset();

    findLessonById.mockResolvedValue(lesson);
    isEnrolled.mockResolvedValue(true);
    isLessonAccessible.mockResolvedValue(true);
    findCompletedSectionIds.mockResolvedValue(new Set());
  });

  it("fails when the lesson does not exist", async () => {
    findLessonById.mockResolvedValue(null);

    const { listLessonSectionsForStudent } = await import("./service");
    const result = await listLessonSectionsForStudent({ lessonId: "missing", actorId: "actor-1" });

    expect(result).toEqual({ success: false, error: { code: "academy.lessons.not_found", message: expect.any(String) } });
  });

  it("fails when the actor is not enrolled", async () => {
    isEnrolled.mockResolvedValue(false);

    const { listLessonSectionsForStudent } = await import("./service");
    const result = await listLessonSectionsForStudent({ lessonId: "lesson-1", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.enrollments.not_enrolled", message: expect.any(String) },
    });
    expect(isLessonAccessible).not.toHaveBeenCalled();
  });

  it("fails when the lesson is locked", async () => {
    isLessonAccessible.mockResolvedValue(false);

    const { listLessonSectionsForStudent } = await import("./service");
    const result = await listLessonSectionsForStudent({ lessonId: "lesson-1", actorId: "actor-1" });

    expect(result).toEqual({ success: false, error: { code: "academy.progress.lesson_locked", message: expect.any(String) } });
  });

  it("returns the sections in position order, annotated with the actor's own completion", async () => {
    const sections = [
      { id: "section-1", lessonId: "lesson-1", position: 1, title: "Introdução", cmsEntryId: "entry-1", videoUrl: null, createdAt: new Date(), updatedAt: new Date() },
      { id: "section-2", lessonId: "lesson-1", position: 2, title: "Sons que ouvimos", cmsEntryId: "entry-2", videoUrl: null, createdAt: new Date(), updatedAt: new Date() },
    ];
    findSectionsByLesson.mockResolvedValue(sections);
    findCompletedSectionIds.mockResolvedValue(new Set(["section-1"]));

    const { listLessonSectionsForStudent } = await import("./service");
    const result = await listLessonSectionsForStudent({ lessonId: "lesson-1", actorId: "actor-1" });

    expect(result).toEqual({
      success: true,
      data: [
        { ...sections[0], completed: true },
        { ...sections[1], completed: false },
      ],
    });
  });
});
