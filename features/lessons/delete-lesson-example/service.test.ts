import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@venore/plugin-sdk/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const findLessonExampleById = vi.fn();
const deleteLessonExample = vi.fn();

vi.mock("./store", () => ({
  findLessonExampleById: (...args: unknown[]) => findLessonExampleById(...args),
  deleteLessonExample: (...args: unknown[]) => deleteLessonExample(...args),
}));

describe("deleteLessonExampleService", () => {
  beforeEach(() => {
    findLessonExampleById.mockReset();
    deleteLessonExample.mockReset();
  });

  it("fails when the example does not exist", async () => {
    findLessonExampleById.mockResolvedValue(null);

    const { deleteLessonExampleService } = await import("./service");
    const result = await deleteLessonExampleService({ id: "missing", actorId: "actor-1" });

    expect(result).toEqual({ success: false, error: { code: "academy.lesson_examples.not_found", message: expect.any(String) } });
    expect(deleteLessonExample).not.toHaveBeenCalled();
  });

  it("deletes the example when it exists", async () => {
    findLessonExampleById.mockResolvedValue({ id: "example-1" });

    const { deleteLessonExampleService } = await import("./service");
    const result = await deleteLessonExampleService({ id: "example-1", actorId: "actor-1" });

    expect(result).toEqual({ success: true, data: { id: "example-1" } });
    expect(deleteLessonExample).toHaveBeenCalledWith("example-1");
  });
});
