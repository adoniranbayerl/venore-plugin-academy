import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@venore/plugin-sdk/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const getMediaAsset = vi.fn();

vi.mock("@venore/plugin-sdk/media", () => ({
  getMediaAsset: (...args: unknown[]) => getMediaAsset(...args),
}));

const findLessonById = vi.fn();
const findNextMaterialPosition = vi.fn();
const insertLessonMaterial = vi.fn();

vi.mock("./store", () => ({
  findLessonById: (...args: unknown[]) => findLessonById(...args),
  findNextMaterialPosition: (...args: unknown[]) => findNextMaterialPosition(...args),
  insertLessonMaterial: (...args: unknown[]) => insertLessonMaterial(...args),
}));

describe("addLessonMaterial", () => {
  beforeEach(() => {
    getMediaAsset.mockReset();
    findLessonById.mockReset();
    findNextMaterialPosition.mockReset();
    insertLessonMaterial.mockReset();
  });

  it("fails when the lesson does not exist", async () => {
    findLessonById.mockResolvedValue(null);

    const { addLessonMaterial } = await import("./service");
    const result = await addLessonMaterial({ lessonId: "missing", mediaId: "media-1", label: "Slides", actorId: "actor-1" });

    expect(result).toEqual({ success: false, error: { code: "academy.lessons.not_found", message: expect.any(String) } });
    expect(insertLessonMaterial).not.toHaveBeenCalled();
  });

  it("fails when mediaId does not reference an existing media asset", async () => {
    findLessonById.mockResolvedValue({ id: "lesson-1" });
    getMediaAsset.mockResolvedValue({ success: true, data: null });

    const { addLessonMaterial } = await import("./service");
    const result = await addLessonMaterial({ lessonId: "lesson-1", mediaId: "missing-media", label: "Slides", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.lesson_materials.invalid_media", message: expect.any(String) },
    });
    expect(insertLessonMaterial).not.toHaveBeenCalled();
  });

  it("inserts the material at the next position when the lesson and media exist", async () => {
    findLessonById.mockResolvedValue({ id: "lesson-1" });
    getMediaAsset.mockResolvedValue({ success: true, data: { id: "media-1" } });
    findNextMaterialPosition.mockResolvedValue(3);
    insertLessonMaterial.mockResolvedValue({
      id: "material-1",
      lessonId: "lesson-1",
      mediaId: "media-1",
      label: "Slides",
      position: 3,
      createdAt: new Date(),
    });

    const { addLessonMaterial } = await import("./service");
    const result = await addLessonMaterial({ lessonId: "lesson-1", mediaId: "media-1", label: "Slides", actorId: "actor-1" });

    expect(result.success).toBe(true);
    expect(insertLessonMaterial).toHaveBeenCalledWith({ lessonId: "lesson-1", mediaId: "media-1", label: "Slides", position: 3 });
  });
});
