import { beforeEach, describe, expect, it, vi } from "vitest";

const authorizeActor = vi.fn();
vi.mock("@venore/plugin-sdk/rbac", () => ({
  authorizeActor: (...args: unknown[]) => authorizeActor(...args),
}));

const publishCourse = vi.fn();
vi.mock("./service", () => ({
  publishCourse: (...args: unknown[]) => publishCourse(...args),
}));

describe("publishCourseHandler", () => {
  beforeEach(() => {
    authorizeActor.mockReset();
    publishCourse.mockReset();
  });

  it("fails validation before checking authorization when id is empty", async () => {
    const { publishCourseHandler } = await import("./handler");
    const result = await publishCourseHandler({ id: "", status: "public" });

    expect(result).toEqual({ success: false, error: { code: "academy.courses.invalid_id", message: expect.any(String) } });
    expect(authorizeActor).not.toHaveBeenCalled();
  });

  // "draft" não é um status publicável — voltar a rascunho é unpublish-course, sem validação de
  // conteúdo (ver contracts/types.ts, AcademyStatus).
  it("rejects a status other than restricted/public before checking authorization", async () => {
    const { publishCourseHandler } = await import("./handler");
    const result = await publishCourseHandler({ id: "course-1", status: "draft" as never });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.courses.invalid_status", message: expect.any(String) },
    });
    expect(authorizeActor).not.toHaveBeenCalled();
  });

  it("propagates the authorization error without calling the service", async () => {
    authorizeActor.mockResolvedValue({
      authorized: false,
      error: { code: "rbac.authorization.forbidden", message: "..." },
    });

    const { publishCourseHandler } = await import("./handler");
    const result = await publishCourseHandler({ id: "course-1", status: "public" });

    expect(result).toEqual({
      success: false,
      error: { code: "rbac.authorization.forbidden", message: expect.any(String) },
    });
    expect(publishCourse).not.toHaveBeenCalled();
  });

  it("calls the service with the actor from authorization", async () => {
    authorizeActor.mockResolvedValue({ authorized: true, actorId: "actor-1" });
    publishCourse.mockResolvedValue({ success: true, data: { id: "course-1", status: "restricted" } });

    const { publishCourseHandler } = await import("./handler");
    await publishCourseHandler({ id: "course-1", status: "restricted" });

    expect(publishCourse).toHaveBeenCalledWith({ id: "course-1", status: "restricted", actorId: "actor-1" });
  });
});
