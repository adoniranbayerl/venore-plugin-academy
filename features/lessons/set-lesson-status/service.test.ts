import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@venore/plugin-sdk/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const findLessonById = vi.fn();
const updateLessonStatus = vi.fn();

vi.mock("./store", () => ({
  findLessonById: (...args: unknown[]) => findLessonById(...args),
  updateLessonStatus: (...args: unknown[]) => updateLessonStatus(...args),
}));

describe("setLessonStatus", () => {
  beforeEach(() => {
    findLessonById.mockReset();
    updateLessonStatus.mockReset();
  });

  it("fails when the lesson does not exist", async () => {
    findLessonById.mockResolvedValue(null);

    const { setLessonStatus } = await import("./service");
    const result = await setLessonStatus({ id: "missing", status: "public", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.lessons.not_found", message: expect.any(String) },
    });
    expect(updateLessonStatus).not.toHaveBeenCalled();
  });

  it("updates the lesson status", async () => {
    findLessonById.mockResolvedValue({ id: "lesson-1", status: "draft" });
    updateLessonStatus.mockResolvedValue({ id: "lesson-1", status: "public" });

    const { setLessonStatus } = await import("./service");
    const result = await setLessonStatus({ id: "lesson-1", status: "public", actorId: "actor-1" });

    expect(result).toEqual({ success: true, data: { id: "lesson-1", status: "public" } });
    expect(updateLessonStatus).toHaveBeenCalledWith("lesson-1", "public");
  });
});
