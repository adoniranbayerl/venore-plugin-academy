import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@venore/plugin-sdk/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const findLessonById = vi.fn();
const findNextActivityPosition = vi.fn();
const insertLessonActivity = vi.fn();

vi.mock("./store", () => ({
  findLessonById: (...args: unknown[]) => findLessonById(...args),
  findNextActivityPosition: (...args: unknown[]) => findNextActivityPosition(...args),
  insertLessonActivity: (...args: unknown[]) => insertLessonActivity(...args),
}));

describe("addLessonActivity", () => {
  beforeEach(() => {
    findLessonById.mockReset();
    findNextActivityPosition.mockReset();
    insertLessonActivity.mockReset();
  });

  it("fails when the lesson does not exist", async () => {
    findLessonById.mockResolvedValue(null);

    const { addLessonActivity } = await import("./service");
    const result = await addLessonActivity({
      lessonId: "missing",
      title: "Grave um trecho cantado",
      instructionsText: "Cante a escala de dó maior e grave um áudio.",
      deliverableFormat: "audio",
      actorId: "actor-1",
    });

    expect(result).toEqual({ success: false, error: { code: "academy.lessons.not_found", message: expect.any(String) } });
    expect(insertLessonActivity).not.toHaveBeenCalled();
  });

  it("inserts the activity at the next position when the lesson exists", async () => {
    findLessonById.mockResolvedValue({ id: "lesson-1" });
    findNextActivityPosition.mockResolvedValue(2);
    insertLessonActivity.mockResolvedValue({
      id: "activity-1",
      lessonId: "lesson-1",
      title: "Grave um trecho cantado",
      instructionsText: "Cante a escala de dó maior e grave um áudio.",
      deliverableFormat: "audio",
      position: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { addLessonActivity } = await import("./service");
    const result = await addLessonActivity({
      lessonId: "lesson-1",
      title: "Grave um trecho cantado",
      instructionsText: "Cante a escala de dó maior e grave um áudio.",
      deliverableFormat: "audio",
      actorId: "actor-1",
    });

    expect(result.success).toBe(true);
    expect(insertLessonActivity).toHaveBeenCalledWith(expect.objectContaining({ position: 2 }));
  });
});
