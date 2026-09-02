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
const updateLesson = vi.fn();

vi.mock("./store", () => ({
  findLessonById: (...args: unknown[]) => findLessonById(...args),
  updateLesson: (...args: unknown[]) => updateLesson(...args),
}));

const existingLesson = {
  id: "lesson-1",
  courseId: "course-1",
  title: "Aula 1",
  body: null,
  videoUrl: null,
  position: 1,
  coverMediaId: null,
  status: "restricted",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("updateLessonService", () => {
  beforeEach(() => {
    getMediaAsset.mockReset();
    findLessonById.mockReset();
    updateLesson.mockReset();
  });

  it("fails when the lesson does not exist", async () => {
    findLessonById.mockResolvedValue(null);

    const { updateLessonService } = await import("./service");
    const result = await updateLessonService({ id: "missing", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.lessons.not_found", message: expect.any(String) },
    });
    expect(updateLesson).not.toHaveBeenCalled();
  });

  it("fails when coverMediaId does not reference an existing media asset", async () => {
    findLessonById.mockResolvedValue(existingLesson);
    getMediaAsset.mockResolvedValue({ success: true, data: null });

    const { updateLessonService } = await import("./service");
    const result = await updateLessonService({ id: "lesson-1", coverMediaId: "missing-media", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.lessons.invalid_cover_media", message: expect.any(String) },
    });
    expect(updateLesson).not.toHaveBeenCalled();
  });

  it("updates the lesson title and body", async () => {
    findLessonById.mockResolvedValue(existingLesson);
    updateLesson.mockResolvedValue({ ...existingLesson, title: "Novo título", body: "Novo conteúdo" });

    const { updateLessonService } = await import("./service");
    const result = await updateLessonService({
      id: "lesson-1",
      title: "Novo título",
      body: "Novo conteúdo",
      actorId: "actor-1",
    });

    expect(result.success).toBe(true);
    expect(updateLesson).toHaveBeenCalledWith("lesson-1", {
      title: "Novo título",
      body: "Novo conteúdo",
      videoUrl: undefined,
      coverMediaId: undefined,
    });
  });

  it("updates videoUrl without touching title/body", async () => {
    findLessonById.mockResolvedValue(existingLesson);
    updateLesson.mockResolvedValue({ ...existingLesson, videoUrl: "https://video" });

    const { updateLessonService } = await import("./service");
    const result = await updateLessonService({ id: "lesson-1", videoUrl: "https://video", actorId: "actor-1" });

    expect(result.success).toBe(true);
    expect(getMediaAsset).not.toHaveBeenCalled();
  });
});
