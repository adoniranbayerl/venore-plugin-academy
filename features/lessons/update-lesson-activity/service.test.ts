import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@venore/plugin-sdk/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const findLessonActivityById = vi.fn();
const updateLessonActivity = vi.fn();

vi.mock("./store", () => ({
  findLessonActivityById: (...args: unknown[]) => findLessonActivityById(...args),
  updateLessonActivity: (...args: unknown[]) => updateLessonActivity(...args),
}));

describe("updateLessonActivityService", () => {
  beforeEach(() => {
    findLessonActivityById.mockReset();
    updateLessonActivity.mockReset();
  });

  it("fails when the activity does not exist", async () => {
    findLessonActivityById.mockResolvedValue(null);

    const { updateLessonActivityService } = await import("./service");
    const result = await updateLessonActivityService({ id: "missing", title: "Novo título", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.lesson_activities.not_found", message: expect.any(String) },
    });
    expect(updateLessonActivity).not.toHaveBeenCalled();
  });

  it("updates the activity when it exists", async () => {
    findLessonActivityById.mockResolvedValue({ id: "activity-1" });
    updateLessonActivity.mockResolvedValue({ id: "activity-1", title: "Novo título" });

    const { updateLessonActivityService } = await import("./service");
    const result = await updateLessonActivityService({ id: "activity-1", title: "Novo título", actorId: "actor-1" });

    expect(result.success).toBe(true);
    expect(updateLessonActivity).toHaveBeenCalledWith("activity-1", {
      title: "Novo título",
      instructionsText: undefined,
      deliverableFormat: undefined,
    });
  });
});
