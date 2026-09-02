import { beforeEach, describe, expect, it, vi } from "vitest";

const authorizeActor = vi.fn();
vi.mock("@venore/plugin-sdk/rbac", () => ({
  authorizeActor: (...args: unknown[]) => authorizeActor(...args),
}));

const setLessonStatus = vi.fn();
vi.mock("./service", () => ({
  setLessonStatus: (...args: unknown[]) => setLessonStatus(...args),
}));

describe("setLessonStatusHandler", () => {
  beforeEach(() => {
    authorizeActor.mockReset();
    setLessonStatus.mockReset();
  });

  it("fails validation before checking authorization when id is empty", async () => {
    const { setLessonStatusHandler } = await import("./handler");
    const result = await setLessonStatusHandler({ id: "", status: "draft" });

    expect(result).toEqual({ success: false, error: { code: "academy.lessons.invalid_id", message: expect.any(String) } });
    expect(authorizeActor).not.toHaveBeenCalled();
  });

  it("rejects a status outside draft/restricted/public before checking authorization", async () => {
    const { setLessonStatusHandler } = await import("./handler");
    const result = await setLessonStatusHandler({ id: "lesson-1", status: "published" as never });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.lessons.invalid_status", message: expect.any(String) },
    });
    expect(authorizeActor).not.toHaveBeenCalled();
  });

  it("propagates the authorization error without calling the service", async () => {
    authorizeActor.mockResolvedValue({
      authorized: false,
      error: { code: "rbac.authorization.forbidden", message: "..." },
    });

    const { setLessonStatusHandler } = await import("./handler");
    const result = await setLessonStatusHandler({ id: "lesson-1", status: "public" });

    expect(result).toEqual({
      success: false,
      error: { code: "rbac.authorization.forbidden", message: expect.any(String) },
    });
    expect(setLessonStatus).not.toHaveBeenCalled();
  });

  it("calls the service with the actor from authorization", async () => {
    authorizeActor.mockResolvedValue({ authorized: true, actorId: "actor-1" });
    setLessonStatus.mockResolvedValue({ success: true, data: { id: "lesson-1", status: "public" } });

    const { setLessonStatusHandler } = await import("./handler");
    await setLessonStatusHandler({ id: "lesson-1", status: "public" });

    expect(setLessonStatus).toHaveBeenCalledWith({ id: "lesson-1", status: "public", actorId: "actor-1" });
  });
});
