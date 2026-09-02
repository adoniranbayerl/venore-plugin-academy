import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@venore/plugin-sdk/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const findLessonActivityById = vi.fn();
const countActivitySubmissions = vi.fn();
const deleteLessonActivity = vi.fn();

vi.mock("./store", () => ({
  findLessonActivityById: (...args: unknown[]) => findLessonActivityById(...args),
  countActivitySubmissions: (...args: unknown[]) => countActivitySubmissions(...args),
  deleteLessonActivity: (...args: unknown[]) => deleteLessonActivity(...args),
}));

describe("deleteLessonActivityService", () => {
  beforeEach(() => {
    findLessonActivityById.mockReset();
    countActivitySubmissions.mockReset();
    deleteLessonActivity.mockReset();
  });

  it("fails when the activity does not exist", async () => {
    findLessonActivityById.mockResolvedValue(null);

    const { deleteLessonActivityService } = await import("./service");
    const result = await deleteLessonActivityService({ id: "missing", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.lesson_activities.not_found", message: expect.any(String) },
    });
    expect(deleteLessonActivity).not.toHaveBeenCalled();
  });

  it("fails when a student submission already exists", async () => {
    findLessonActivityById.mockResolvedValue({ id: "activity-1" });
    countActivitySubmissions.mockResolvedValue(1);

    const { deleteLessonActivityService } = await import("./service");
    const result = await deleteLessonActivityService({ id: "activity-1", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.lesson_activities.cannot_delete_has_submissions", message: expect.any(String) },
    });
    expect(deleteLessonActivity).not.toHaveBeenCalled();
  });

  it("deletes the activity when there are no submissions", async () => {
    findLessonActivityById.mockResolvedValue({ id: "activity-1" });
    countActivitySubmissions.mockResolvedValue(0);

    const { deleteLessonActivityService } = await import("./service");
    const result = await deleteLessonActivityService({ id: "activity-1", actorId: "actor-1" });

    expect(result).toEqual({ success: true, data: { id: "activity-1" } });
    expect(deleteLessonActivity).toHaveBeenCalledWith("activity-1");
  });
});
