import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@venore/plugin-sdk/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const findLessonMaterialById = vi.fn();
const deleteLessonMaterial = vi.fn();

vi.mock("./store", () => ({
  findLessonMaterialById: (...args: unknown[]) => findLessonMaterialById(...args),
  deleteLessonMaterial: (...args: unknown[]) => deleteLessonMaterial(...args),
}));

describe("deleteLessonMaterialService", () => {
  beforeEach(() => {
    findLessonMaterialById.mockReset();
    deleteLessonMaterial.mockReset();
  });

  it("fails when the material does not exist", async () => {
    findLessonMaterialById.mockResolvedValue(null);

    const { deleteLessonMaterialService } = await import("./service");
    const result = await deleteLessonMaterialService({ id: "missing", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.lesson_materials.not_found", message: expect.any(String) },
    });
    expect(deleteLessonMaterial).not.toHaveBeenCalled();
  });

  it("deletes the material when it exists", async () => {
    findLessonMaterialById.mockResolvedValue({
      id: "material-1",
      lessonId: "lesson-1",
      mediaId: "media-1",
      label: "Slides",
      position: 1,
      createdAt: new Date(),
    });
    deleteLessonMaterial.mockResolvedValue(undefined);

    const { deleteLessonMaterialService } = await import("./service");
    const result = await deleteLessonMaterialService({ id: "material-1", actorId: "actor-1" });

    expect(result).toEqual({ success: true, data: { id: "material-1" } });
    expect(deleteLessonMaterial).toHaveBeenCalledWith("material-1");
  });
});
