import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@venore/plugin-sdk/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const isEnrolled = vi.fn();
vi.mock("../../../shared/enrollment", () => ({
  isEnrolled: (...args: unknown[]) => isEnrolled(...args),
}));

const insertMaterialCompletionIfMissing = vi.fn();
const isLessonAccessible = vi.fn();
vi.mock("../../../shared/lesson-progress", () => ({
  insertMaterialCompletionIfMissing: (...args: unknown[]) => insertMaterialCompletionIfMissing(...args),
  isLessonAccessible: (...args: unknown[]) => isLessonAccessible(...args),
}));

const findLessonById = vi.fn();
const findMaterialById = vi.fn();
vi.mock("./store", () => ({
  findLessonById: (...args: unknown[]) => findLessonById(...args),
  findMaterialById: (...args: unknown[]) => findMaterialById(...args),
}));

const material = { id: "material-1", lessonId: "lesson-1", mediaId: "media-1", label: "Áudio", position: 1, createdAt: new Date() };
const lesson = { id: "lesson-1", courseId: "course-1", position: 1 };

describe("markLessonMaterialRead", () => {
  beforeEach(() => {
    isEnrolled.mockReset();
    insertMaterialCompletionIfMissing.mockReset();
    isLessonAccessible.mockReset();
    findLessonById.mockReset();
    findMaterialById.mockReset();

    findMaterialById.mockResolvedValue(material);
    findLessonById.mockResolvedValue(lesson);
    isEnrolled.mockResolvedValue(true);
    isLessonAccessible.mockResolvedValue(true);
  });

  it("fails when the material does not exist", async () => {
    findMaterialById.mockResolvedValue(null);

    const { markLessonMaterialRead } = await import("./service");
    const result = await markLessonMaterialRead({ materialId: "missing", actorId: "actor-1" });

    expect(result).toEqual({ success: false, error: { code: "academy.lesson_materials.not_found", message: expect.any(String) } });
    expect(insertMaterialCompletionIfMissing).not.toHaveBeenCalled();
  });

  it("fails when the actor is not enrolled", async () => {
    isEnrolled.mockResolvedValue(false);

    const { markLessonMaterialRead } = await import("./service");
    const result = await markLessonMaterialRead({ materialId: "material-1", actorId: "actor-1" });

    expect(result).toEqual({ success: false, error: { code: "academy.enrollments.not_enrolled", message: expect.any(String) } });
  });

  it("marks the material as read when enrolled and accessible", async () => {
    const { markLessonMaterialRead } = await import("./service");
    const result = await markLessonMaterialRead({ materialId: "material-1", actorId: "actor-1" });

    expect(result).toEqual({ success: true, data: { materialId: "material-1", completed: true } });
    expect(insertMaterialCompletionIfMissing).toHaveBeenCalledWith("material-1", "actor-1");
  });
});
