import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@venore/plugin-sdk/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const findCourseById = vi.fn();
const markCourseUnpublished = vi.fn();

vi.mock("./store", () => ({
  findCourseById: (...args: unknown[]) => findCourseById(...args),
  markCourseUnpublished: (...args: unknown[]) => markCourseUnpublished(...args),
}));

describe("unpublishCourse", () => {
  beforeEach(() => {
    findCourseById.mockReset();
    markCourseUnpublished.mockReset();
  });

  it("fails when the course does not exist", async () => {
    findCourseById.mockResolvedValue(null);

    const { unpublishCourse } = await import("./service");
    const result = await unpublishCourse({ id: "missing", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "academy.courses.not_found", message: expect.any(String) },
    });
    expect(markCourseUnpublished).not.toHaveBeenCalled();
  });

  it("sets the course status back to draft", async () => {
    findCourseById.mockResolvedValue({
      id: "course-1",
      title: "Course",
      description: null,
      status: "public",
      createdBy: "actor-1",
      publiclyListed: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    markCourseUnpublished.mockResolvedValue({ id: "course-1", status: "draft" });

    const { unpublishCourse } = await import("./service");
    const result = await unpublishCourse({ id: "course-1", actorId: "actor-1" });

    expect(result.success).toBe(true);
    expect(markCourseUnpublished).toHaveBeenCalledWith("course-1");
  });
});
