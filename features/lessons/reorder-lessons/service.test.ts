import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@venore/plugin-sdk/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const findLessonsByCourse = vi.fn();
const reorderLessons = vi.fn();

vi.mock("./store", () => ({
  findLessonsByCourse: (...args: unknown[]) => findLessonsByCourse(...args),
  reorderLessons: (...args: unknown[]) => reorderLessons(...args),
}));

function lesson(id: string, position: number) {
  return {
    id,
    courseId: "course-1",
    cmsEntryId: `entry-${id}`,
    videoUrl: null,
    position,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe("reorderLessonsService", () => {
  beforeEach(() => {
    findLessonsByCourse.mockReset();
    reorderLessons.mockReset();
  });

  it("fails when the provided lessonIds do not match the course's lessons exactly", async () => {
    findLessonsByCourse.mockResolvedValue([lesson("lesson-1", 1), lesson("lesson-2", 2)]);

    const { reorderLessonsService } = await import("./service");
    const result = await reorderLessonsService({
      courseId: "course-1",
      lessonIds: ["lesson-1", "lesson-3"],
      actorId: "actor-1",
    });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.lessons.reorder_mismatch", message: expect.any(String) },
    });
    expect(reorderLessons).not.toHaveBeenCalled();
  });

  it("fails when the provided lessonIds contain duplicates", async () => {
    findLessonsByCourse.mockResolvedValue([lesson("lesson-1", 1), lesson("lesson-2", 2)]);

    const { reorderLessonsService } = await import("./service");
    const result = await reorderLessonsService({
      courseId: "course-1",
      lessonIds: ["lesson-1", "lesson-1"],
      actorId: "actor-1",
    });

    expect(result.success).toBe(false);
    expect(reorderLessons).not.toHaveBeenCalled();
  });

  it("reorders the lessons when the set of ids matches exactly", async () => {
    findLessonsByCourse.mockResolvedValue([lesson("lesson-1", 1), lesson("lesson-2", 2)]);
    reorderLessons.mockResolvedValue([lesson("lesson-2", 1), lesson("lesson-1", 2)]);

    const { reorderLessonsService } = await import("./service");
    const result = await reorderLessonsService({
      courseId: "course-1",
      lessonIds: ["lesson-2", "lesson-1"],
      actorId: "actor-1",
    });

    expect(result.success).toBe(true);
    expect(reorderLessons).toHaveBeenCalledWith("course-1", ["lesson-2", "lesson-1"]);
  });
});
