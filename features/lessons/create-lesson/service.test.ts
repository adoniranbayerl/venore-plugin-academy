import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@venore/plugin-sdk/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const getMediaAsset = vi.fn();

vi.mock("@venore/plugin-sdk/media", () => ({
  getMediaAsset: (...args: unknown[]) => getMediaAsset(...args),
}));

const findNextPosition = vi.fn();
const insertLesson = vi.fn();

vi.mock("./store", () => ({
  findNextPosition: (...args: unknown[]) => findNextPosition(...args),
  insertLesson: (...args: unknown[]) => insertLesson(...args),
}));

describe("createLesson", () => {
  beforeEach(() => {
    getMediaAsset.mockReset();
    findNextPosition.mockReset();
    insertLesson.mockReset();
  });

  it("fails when coverMediaId does not reference an existing media asset", async () => {
    getMediaAsset.mockResolvedValue({ success: true, data: null });

    const { createLesson } = await import("./service");
    const result = await createLesson({ courseId: "course-1", title: "Aula 1", coverMediaId: "missing-media", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.lessons.invalid_cover_media", message: expect.any(String) },
    });
    expect(insertLesson).not.toHaveBeenCalled();
  });

  it("creates the lesson at the next available position", async () => {
    findNextPosition.mockResolvedValue(3);
    insertLesson.mockResolvedValue({
      id: "lesson-1",
      courseId: "course-1",
      title: "Aula 1",
      body: null,
      videoUrl: null,
      position: 3,
      coverMediaId: null,
      status: "restricted",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { createLesson } = await import("./service");
    const result = await createLesson({ courseId: "course-1", title: "Aula 1", actorId: "actor-1" });

    expect(result.success).toBe(true);
    expect(insertLesson).toHaveBeenCalledWith({
      courseId: "course-1",
      title: "Aula 1",
      body: undefined,
      videoUrl: undefined,
      coverMediaId: undefined,
      position: 3,
    });
  });
});
