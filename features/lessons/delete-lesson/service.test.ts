import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@venore/plugin-sdk/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const findLessonById = vi.fn();
const hasStudentProgress = vi.fn();
const deleteLessonAndRenumber = vi.fn();

vi.mock("./store", () => ({
  findLessonById: (...args: unknown[]) => findLessonById(...args),
  hasStudentProgress: (...args: unknown[]) => hasStudentProgress(...args),
  deleteLessonAndRenumber: (...args: unknown[]) => deleteLessonAndRenumber(...args),
}));

const existingLesson = {
  id: "lesson-1",
  courseId: "course-1",
  cmsEntryId: "entry-1",
  videoUrl: null,
  position: 2,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("deleteLessonService", () => {
  beforeEach(() => {
    findLessonById.mockReset();
    hasStudentProgress.mockReset();
    deleteLessonAndRenumber.mockReset();
  });

  it("fails when the lesson does not exist", async () => {
    findLessonById.mockResolvedValue(null);

    const { deleteLessonService } = await import("./service");
    const result = await deleteLessonService({ id: "missing", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.lessons.not_found", message: expect.any(String) },
    });
    expect(deleteLessonAndRenumber).not.toHaveBeenCalled();
  });

  it("refuses to delete when a student already has progress or a quiz attempt", async () => {
    findLessonById.mockResolvedValue(existingLesson);
    hasStudentProgress.mockResolvedValue(true);

    const { deleteLessonService } = await import("./service");
    const result = await deleteLessonService({ id: "lesson-1", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.lessons.cannot_delete_has_progress", message: expect.any(String) },
    });
    expect(deleteLessonAndRenumber).not.toHaveBeenCalled();
  });

  it("deletes the lesson and renumbers the following lessons when there is no student progress", async () => {
    findLessonById.mockResolvedValue(existingLesson);
    hasStudentProgress.mockResolvedValue(false);
    deleteLessonAndRenumber.mockResolvedValue(undefined);

    const { deleteLessonService } = await import("./service");
    const result = await deleteLessonService({ id: "lesson-1", actorId: "actor-1" });

    expect(result).toEqual({ success: true, data: { id: "lesson-1" } });
    expect(deleteLessonAndRenumber).toHaveBeenCalledWith("course-1", 2, "lesson-1");
  });
});
