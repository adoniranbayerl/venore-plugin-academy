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
const findNextExamplePosition = vi.fn();
const insertLessonExample = vi.fn();

vi.mock("./store", () => ({
  findLessonById: (...args: unknown[]) => findLessonById(...args),
  findNextExamplePosition: (...args: unknown[]) => findNextExamplePosition(...args),
  insertLessonExample: (...args: unknown[]) => insertLessonExample(...args),
}));

describe("addLessonExample", () => {
  beforeEach(() => {
    findLessonById.mockReset();
    findNextExamplePosition.mockReset();
    insertLessonExample.mockReset();
    getMediaAsset.mockReset();
  });

  it("fails when the lesson does not exist", async () => {
    findLessonById.mockResolvedValue(null);

    const { addLessonExample } = await import("./service");
    const result = await addLessonExample({
      lessonId: "missing",
      title: "Exemplo 1",
      audioMediaId: "media-1",
      captionText: "C4, D4, E4",
      actorId: "actor-1",
    });

    expect(result).toEqual({ success: false, error: { code: "academy.lessons.not_found", message: expect.any(String) } });
    expect(insertLessonExample).not.toHaveBeenCalled();
  });

  it("fails when a referenced media id does not exist", async () => {
    findLessonById.mockResolvedValue({ id: "lesson-1" });
    getMediaAsset.mockResolvedValue({ success: true, data: null });

    const { addLessonExample } = await import("./service");
    const result = await addLessonExample({
      lessonId: "lesson-1",
      title: "Exemplo 1",
      audioMediaId: "missing-media",
      captionText: "C4, D4, E4",
      actorId: "actor-1",
    });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.lesson_examples.invalid_media", message: expect.any(String) },
    });
    expect(insertLessonExample).not.toHaveBeenCalled();
  });

  it("inserts the example at the next position when the lesson and media exist", async () => {
    findLessonById.mockResolvedValue({ id: "lesson-1" });
    getMediaAsset.mockResolvedValue({ success: true, data: { id: "media-1" } });
    findNextExamplePosition.mockResolvedValue(3);
    insertLessonExample.mockResolvedValue({
      id: "example-1",
      lessonId: "lesson-1",
      title: "Exemplo 1",
      audioMediaId: "media-1",
      sheetMediaId: null,
      captionText: "C4, D4, E4",
      position: 3,
      createdAt: new Date(),
    });

    const { addLessonExample } = await import("./service");
    const result = await addLessonExample({
      lessonId: "lesson-1",
      title: "Exemplo 1",
      audioMediaId: "media-1",
      captionText: "C4, D4, E4",
      actorId: "actor-1",
    });

    expect(result.success).toBe(true);
    expect(insertLessonExample).toHaveBeenCalledWith(expect.objectContaining({ position: 3 }));
  });

  it("inserts a notation-only example without touching media", async () => {
    findLessonById.mockResolvedValue({ id: "lesson-1" });
    findNextExamplePosition.mockResolvedValue(1);
    insertLessonExample.mockResolvedValue({
      id: "example-1",
      lessonId: "lesson-1",
      title: "Escala de dó",
      audioMediaId: null,
      sheetMediaId: null,
      notationData: "X:1\nK:C\nL:1/8\nC2 D2 E2 F2 |",
      captionText: "Escala de dó maior ascendente",
      position: 1,
      createdAt: new Date(),
    });

    const { addLessonExample } = await import("./service");
    const result = await addLessonExample({
      lessonId: "lesson-1",
      title: "Escala de dó",
      notationData: "X:1\nK:C\nL:1/8\nC2 D2 E2 F2 |",
      captionText: "Escala de dó maior ascendente",
      actorId: "actor-1",
    });

    expect(result.success).toBe(true);
    expect(getMediaAsset).not.toHaveBeenCalled();
    expect(insertLessonExample).toHaveBeenCalledWith(
      expect.objectContaining({ notationData: "X:1\nK:C\nL:1/8\nC2 D2 E2 F2 |", audioMediaId: null, sheetMediaId: null }),
    );
  });
});
